const f = Deno.args[0];

const content = await Deno.readTextFile(f);

const lang = [...content.matchAll(/```(.+)\n/gm)].map((m) => m.at(1)).filter(
  (m) => m != "core",
).at(0);

let code_output = "";
let inside_code = false;

let core_output = ""
let inside_core = false;

for (const line of content.split("\n")) {
  if (line.startsWith("```")) {
    if (!inside_code && !inside_core) {
      if (line.startsWith("```core")) {
        inside_core = true;
      } else {
        inside_code = true;
      }
    }
    else if (inside_code) {
      inside_code = false;
    }
    else if (inside_core) {
      inside_core = false;
    }
  }
  else if (inside_code) {
    code_output += line + "\n";
  }
  else if (inside_core) {
    core_output += line + "\n";
  }
}

const codefile = `${f}.${lang}`;
await Deno.writeTextFile(codefile, code_output);

const corefile = `${f}.core`;
await Deno.writeTextFile(corefile, core_output.replace("{{NOTEBOOK}}", codefile));


await (new Deno.Command("chmod", { args: ["+x", corefile] })).output()
const { stdout, stderr } = await (new Deno.Command(corefile)).output()
console.log(new TextDecoder().decode(stdout))
console.error(new TextDecoder().decode(stderr))

