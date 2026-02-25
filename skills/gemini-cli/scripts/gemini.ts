#!/usr/bin/env npx ts-node
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

interface GeminiOptions {
  prompt?: string;
  interactive?: boolean;
  context?: string;
  system?: string;
  model?: string;
  temperature?: number;
  format?: "text" | "json" | "markdown";
  output?: string;
  session?: string;
  newSession?: boolean;
}

interface GeminiResponse {
  response: string;
  model: string;
  tokens: {
    input: number;
    output: number;
  };
  timestamp: string;
}

class GeminiCLI {
  private options: GeminiOptions;

  constructor(options: GeminiOptions = {}) {
    this.options = {
      model: options.model || "gemini-2.0-flash",
      temperature: options.temperature || 0.7,
      format: options.format || "text",
      ...options,
    };
  }

  private async executeCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const gemini = spawn("gemini", args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let errorOutput = "";

      gemini.stdout.on("data", (data: Buffer) => {
        output += data.toString();
      });

      gemini.stderr.on("data", (data: Buffer) => {
        errorOutput += data.toString();
      });

      gemini.on("close", (code: number) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Gemini CLI exited with code ${code}: ${errorOutput}`));
        }
      });

      gemini.on("error", (err: Error) => {
        reject(new Error(`Failed to start Gemini CLI: ${err.message}`));
      });
    });
  }

  private buildCommandArgs(): string[] {
    const args: string[] = [];

    if (this.options.prompt) {
      args.push("-p", this.options.prompt);
    }

    if (this.options.interactive) {
      args.push("-i");
    }

    if (this.options.context) {
      args.push("-c", this.options.context);
    }

    if (this.options.system) {
      args.push("-s", this.options.system);
    }

    if (this.options.model) {
      args.push("-m", this.options.model);
    }

    if (this.options.temperature !== undefined) {
      args.push("-t", this.options.temperature.toString());
    }

    if (this.options.format) {
      args.push("-f", this.options.format);
    }

    if (this.options.session) {
      args.push("--session", this.options.session);
    }

    if (this.options.newSession) {
      args.push("--new-session");
    }

    return args;
  }

  public async run(): Promise<GeminiResponse | string> {
    const args = this.buildCommandArgs();

    try {
      const output = await this.executeCommand(args);

      if (this.options.format === "json") {
        try {
          return JSON.parse(output) as GeminiResponse;
        } catch (e) {
          // If output is not valid JSON, return as structured response
          return {
            response: output,
            model: this.options.model || "unknown",
            tokens: { input: 0, output: 0 },
            timestamp: new Date().toISOString(),
          };
        }
      }

      return output;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Failed to start")) {
          console.error("Error: Gemini CLI is not installed or not in PATH");
          console.error("Install it with: npm install -g @google/gemini-cli");
        } else {
          console.error("Gemini CLI Error:", error.message);
        }
      }
      throw error;
    }
  }

  public async saveOutput(output: string, filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, output, "utf-8");
  }
}

function printUsage() {
  console.log(`
Usage: npx ts-node gemini.ts [OPTIONS]

Options:
  -p, --prompt <text>       Prompt/question for the AI
  -i, --interactive        Start in interactive mode
  -c, --context <path>      Add context from a file
  -s, --system <text>       System instructions for the AI
  -m, --model <model>       Specify model (default: gemini-2.0-flash)
  -t, --temperature <n>     Temperature (0.0-1.0, default: 0.7)
  -f, --format <fmt>        Output format: text, json, markdown
  -o, --output <path>       Save output to file
  --session <id>            Continue from a previous session
  --new-session             Start a new session
  --help                    Show this help message

Available Models:
  gemini-2.0-flash   Fast, cost-effective (default)
  gemini-2.5-pro     Most capable
  gemini-2.0-pro     Balanced performance

Examples:
  # Basic prompt
  npx ts-node gemini.ts -p "Explain quantum computing"

  # With context file
  npx ts-node gemini.ts -p "Review this code" -c app.ts

  # With system instructions
  npx ts-node gemini.ts -p "Summarize" -s "You are a technical writer."

  # Interactive mode
  npx ts-node gemini.ts -i

  # Save to file
  npx ts-node gemini.ts -p "Write a story" -o story.txt

  # JSON output
  npx ts-node gemini.ts -p "What is AI?" -f json

Authentication:
  gemini auth login

Documentation: https://geminicli.com/docs/
`);
}

function parseArguments(): GeminiOptions {
  const args = process.argv.slice(2);
  const options: GeminiOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-p":
      case "--prompt":
        if (args[i + 1]) {
          options.prompt = args[++i];
        }
        break;
      case "-i":
      case "--interactive":
        options.interactive = true;
        break;
      case "-c":
      case "--context":
        if (args[i + 1]) {
          options.context = args[++i];
        }
        break;
      case "-s":
      case "--system":
        if (args[i + 1]) {
          options.system = args[++i];
        }
        break;
      case "-m":
      case "--model":
        if (args[i + 1]) {
          options.model = args[++i];
        }
        break;
      case "-t":
      case "--temperature":
        if (args[i + 1]) {
          options.temperature = parseFloat(args[++i]);
        }
        break;
      case "-f":
      case "--format":
        if (args[i + 1]) {
          options.format = args[++i] as "text" | "json" | "markdown";
        }
        break;
      case "-o":
      case "--output":
        if (args[i + 1]) {
          options.output = args[++i];
        }
        break;
      case "--session":
        if (args[i + 1]) {
          options.session = args[++i];
        }
        break;
      case "--new-session":
        options.newSession = true;
        break;
      case "--help":
        printUsage();
        process.exit(0);
        break;
    }
  }

  return options;
}

async function main() {
  const options = parseArguments();
  const gemini = new GeminiCLI(options);

  try {
    const result = await gemini.run();
    const output =
      typeof result === "string" ? result : JSON.stringify(result, null, 2);

    console.log(output);

    if (options.output && typeof result === "string") {
      await gemini.saveOutput(result, options.output);
      console.log(`\nOutput saved to: ${options.output}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

export { GeminiCLI, GeminiOptions, GeminiResponse };
