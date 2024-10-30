const f = Deno.args[0];

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

// TODO: match --- 's to make sur we're in frontmatter
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

