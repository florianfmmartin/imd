# IMD

Interactive MarkDown Implementation

## Implementation

### Dependencies

IMD depends on janet and the spork common library.

```janet
(import spork)
```

### Utils

A simple util to take all values from a fiber.

```janet
(defn take-all [a-fiber]
  (take-while (fn [_] true) a-fiber))
```

### Setup

Let's get all our state prepared:
- notebook path
- notebook content
- lang used
- buffers to write to
- state of our parsing

```janet
(var nb-path (get (dyn :args) 1))
(var nb-content @"")
(let [f (file/open nb-path :r)]
  (set nb-content (take-all (file/lines f)))
  (file/close f))

(var lang
 (get
  (filter (fn [l] (and (not= l "") (not= l "core")))
   (map (fn [l] (string/trim (string/slice l 3)))
    (filter (fn [l] (string/has-prefix? "```" l)) nb-content))) 0))

(var code-buf @"")
(var core-buf @"")
(var inside-code false)
(var inside-core false)
```

### Main loop

Let's read our file and build our code and core files.

```janet
(loop [line :in nb-content]
  (cond
    (string/has-prefix? "```" line)
      (cond
        (and (not inside-code) (not inside-core))
          (cond
            (string/has-prefix? "```core" line)
              (set inside-core true)
            (set inside-code true))
        inside-code
          (set inside-code false)
        inside-core
          (set inside-core false))
    inside-code
      (set code-buf (string code-buf line))
    inside-core
      (set core-buf (string core-buf line))
    nil))
```

### Finalization

Let's write our two files, make the core executable, and run the notebook.

```janet
(var code-file-path (string "./" nb-path "." lang))
(var core-file-path (string "./" nb-path ".core"))

(let [f (file/open code-file-path :w)]
  (file/write f code-buf)
  (file/flush f)
  (file/close f))

(let [f (file/open core-file-path :w)]
  (file/write f (string/replace-all "{{NOTEBOOK}}" code-file-path core-buf))
  (file/flush f)
  (file/close f))

(os/chmod core-file-path 8r755)
(os/shell core-file-path)
```

## Core

Our core to bootstrap IMD.

```core
#!/bin/sh
janet {{NOTEBOOK}} {{NOTEBOOK}}
```

