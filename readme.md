# IMD

Interactive MarkDown

## Why?

Notebooks are nice.
But there is little standard formats.
Jupyter Notebooks are big JSON files which are note easy to read for humans.
IMD leverages `.md` files to create self-contained notebooks.

## Examples

See [the main example](./examples/) and its ouputs.

## IMD is a simple solution

1. Write a `.md` file
2. Put your code in triple ticks code blocks with a language tag
3. Put a triple tick code blocks with `core` as the language tag
4. You may use `{{NOTEBOOK}}` in your core, it's replaced with the name of the notebook code output: `notebook.md.LANG`
5. Use `imd` on the notebook to run it

