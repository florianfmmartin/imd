import { Renderer } from "jsr:@libs/markdown";

const help =
  "imd [cmd] [file]\n\tcmd\t`show` or `exec`\n\tfile\tpath to the `.imd` notebook";
const cmds = ["show", "exec", "edit"];
const css = await Deno.readTextFile("./index.css")

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

  if (code === 0) {
    console.log("Success :)");
    console.log(new TextDecoder().decode(stdout));
  } else {
    console.log("Failed :(");
    console.log(new TextDecoder().decode(stderr));
  }
};

const edit = async (f: string) => {
  const server = Deno.serve((req) => {
    const path = req.url.split("/").slice(3)
    if (path.length == 0) {
      // HOME
    }
    if (path[0] == "exec") {
      // exec code
    }
  });
  const { hostname, port } = server.addr
  const url = `http://${hostname}:${port}`
  await run(`xdg-open ${url}`);
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
  } else if (cmd == "exec") {
    await exec(file);
  } else if (cmd == "edit") {
    await edit(file)
  }
};

await main();
