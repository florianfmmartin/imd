import { Renderer } from "jsr:@libs/markdown";

const help =
  "imd [cmd] [file]\n\tcmd\t`show` or `exec`\n\tfile\tpath to the `.imd` notebook";
const cmds = ["show", "exec", "edit"];
const css = `
:root {
    --bg: #eee;
    --fg: #333;
    --code-bg: #ddd;
    --accent: #797;
    font-family: monospace;
    font-size: 16px;
}

body {
    background: var(--bg);
    color: var(--fg);
    max-width: 800px;
    margin: auto;
}

pre > code {
    background: var(--code-bg);
    color: var(--accent);
    padding: 0.75rem;
    display: block;
    border-radius: 0.3rem;
    width: auto;
    white-space: pre-wrap;
    max-width: 100%;
}

code {
    background: var(--code-bg);
    color: var(--accent);
    padding: 1px 6px;
    border-radius: 3px;
}

.content {
    max-width: 800px;
    margin: auto;
    padding: 1rem;
}

li {
    margin-top: 0.5rem;
}
`;

const run = async (c: string) => {
  const cs = c.split(" ");
  const e = new Deno.Command(cs[0], { args: cs.splice(1) });
  return await e.output();
};

const show = async (f: string) => {
  const content = await Deno.readTextFile(f);
  const html = (await Renderer.render(content)).split("\n").slice(2).join("\n");
  const htmlFile = `${f}.html`;
  await Deno.writeTextFile(
    htmlFile,
    `<html><body><style>${css}</style>${html}</body></html>`,
  );
  await run(`xdg-open ./${htmlFile}`);
};

const exec = async (f: string) => {
  const content = await Deno.readTextFile(f);

  const lang = content.match(/```(.+)\n/m)?.[1];

  let output = "";
  let inside_code = false;

  for (const line of content.split("\n")) {
    if (!inside_code && line.startsWith("```")) {
      inside_code = true;
    } else if (inside_code) {
      if (line.startsWith("```")) {
        output += "\n";
        inside_code = false;
      } else {
        output += line + "\n";
      }
    }
  }

  const outfile = `${f}.${lang}`;
  await Deno.writeTextFile(outfile, output);

  const command: string[] = content.match(/core: (.*)/)?.[1].replace(
    "$FILE",
    `./${outfile}`,
  ).split(" ")!;
  const out = new Deno.Command(command[0], { args: command.slice(1) });
  const { code, stdout, stderr } = await out.output();
  console.assert(code === 0);
  console.log(new TextDecoder().decode(stdout));
  console.error(new TextDecoder().decode(stderr));
};

const main = async () => {
  const cmd = Deno.args[0];

  if (!cmds.includes(cmd)) {
    console.log(help);
    console.log(Deno.args);
    Deno.exit();
  }

  const file = Deno.args[1];

  if (cmd == "show") {
    await show(file);
  } else {
    await exec(file);
  }
};

await main();
