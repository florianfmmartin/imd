import { Renderer } from "jsr:@libs/markdown";

const help = "imd [cmd] [file]\n\tcmd\t`show` or `exec`\n\tfile\tpath to the `.imd` notebook"
const cmds = ["show", "exec"]

const run = async (c: string) => {
  const cs = c.split(" ")
  const e = new Deno.Command(cs[0], { args: cs.splice(1) })
  await e.output()
}

const show = async (f: string) => {
  const content = await Deno.readTextFile(f)
  const html = await Renderer.render(content)
  const htmlFile = `${f}.html`
  await Deno.writeTextFile(htmlFile, html)
  await run(`xdg-open ./${htmlFile}`)
}

const exec = async (f: string) => {
  const content = await Deno.readTextFile(f)

  const lang = content.match(/```(.+)\n/m)?.[1]

  let output = ""
  let inside_code = false;

  for (const line of content.split("\n")) {
    if (!inside_code && line.startsWith("```")) {
      inside_code = true
    }
    else if (inside_code) {
      if (line.startsWith("```")) {
        output += "\n"
        inside_code = false
      }
      else {
        output += line + "\n"
      }
    }
  }

  const outfile = `${f}.${lang}`
  await Deno.writeTextFile(outfile, output)
}

const main = async () => {
  const cmd = Deno.args[0]

  if (!cmds.includes(cmd)) {
    console.log(help)
    console.log(Deno.args)
    Deno.exit()
  }

  const file = Deno.args[1]

  if (cmd == "show") {
    await show(file)
  }
  else {
    await exec(file)
  }
}

await main()

