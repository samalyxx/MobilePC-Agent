import fs from "node:fs/promises";
import path from "node:path";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

export class ScreenRecorder {
  private process?: ChildProcessWithoutNullStreams;
  private output?: string;

  constructor(
    private readonly ffmpegBin: string,
    private readonly artifactDir: string
  ) {}

  async start(label: string): Promise<string> {
    if (this.process) return this.output ?? "";
    await fs.mkdir(this.artifactDir, { recursive: true });
    this.output = path.resolve(this.artifactDir, `${label}-${Date.now()}.mp4`);
    this.process = spawn(this.ffmpegBin, [
      "-y",
      "-f",
      "gdigrab",
      "-framerate",
      "15",
      "-i",
      "desktop",
      "-pix_fmt",
      "yuv420p",
      this.output
    ]);
    return this.output;
  }

  async stop(): Promise<string | undefined> {
    const current = this.process;
    if (!current) return this.output;
    current.stdin.write("q");
    await new Promise<void>((resolve) => current.once("close", () => resolve()));
    this.process = undefined;
    return this.output;
  }
}
