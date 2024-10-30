# IMD

Interactive MarkDown

## Why?

Notebooks are nice, but so complex for no reasons.

## Examples

See [the main example](./examples/fibonacci.imd) and its ouputs.

## IMD is a simple solution

1. Write a `.md` file
1. Use a yaml frontmatter with an attribute of key `core`
1. The value from this attribute is a shell cmd to execute
1. Run `imd` it will strip out the code blocks and make an output file
1. The name of the output file is the name of the `.md` notebook plus the lang following the first code block
1. `imd` will set a env var named `IMD_TMP` with the output file
1. `imd` will run the shell cmd

