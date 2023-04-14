import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { useTheme } from "styled-components";
import * as monaco from "monaco-editor";

import { explorerAtom, refreshExplorerAtom } from "../../../../../../../state";
import {
  Lang,
  PgCommon,
  PgExplorer,
  PgPkg,
  PgTerminal,
} from "../../../../../../../utils/pg";
import { EventName } from "../../../../../../../constants";

const Monaco = () => {
  const [explorer] = useAtom(explorerAtom);
  const [explorerChanged] = useAtom(refreshExplorerAtom);

  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
  const [isThemeSet, setIsThemeSet] = useState(false);

  const monacoRef = useRef<HTMLDivElement>(null);

  // Set default options
  useEffect(() => {
    // Compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      lib: ["es2015"],
      module: monaco.languages.typescript.ModuleKind.ESNext,
      target: monaco.languages.typescript.ScriptTarget.ES2017,
      allowNonTsExtensions: true,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      lib: ["es2015"],
      module: monaco.languages.typescript.ModuleKind.ESNext,
      target: monaco.languages.typescript.ScriptTarget.ES2017,
      allowNonTsExtensions: true,
    });

    // Diagnostic options
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      diagnosticCodesToIgnore: [
        1375, // top level await
        2686, // UMD global because of module
      ],
    });
  }, []);

  const theme = useTheme();

  // Set theme
  useEffect(() => {
    if (theme.isDark) {
      // Monaco only takes hex values
      const orTransparent = (v: string) => {
        return v === "transparent" || v === "inherit" ? "#00000000" : v;
      };

      const editorStyles = theme.components.editor;
      const inputStyles = theme.components.input;
      const hl = theme.highlight;

      monaco.editor.defineTheme(theme.name, {
        base: "vs-dark",
        inherit: true,
        colors: {
          // General
          foreground: editorStyles.default.color!,
          errorForeground: theme.colors.state.error.color,
          descriptionForeground: theme.colors.default.textSecondary,
          focusBorder:
            theme.colors.default.primary + theme.default.transparency!.high,

          // Editor
          "editor.foreground": editorStyles.default.color!,
          "editor.background": orTransparent(editorStyles.default.bg!),
          "editorCursor.foreground": editorStyles.default.cursorColor!,
          "editor.lineHighlightBackground": orTransparent(
            editorStyles.default.activeLine!.bg!
          ),
          "editor.lineHighlightBorder": orTransparent(
            editorStyles.default.activeLine!.borderColor!
          ),
          "editor.selectionBackground": editorStyles.default.selection!.bg!,
          "editor.inactiveSelectionBackground":
            editorStyles.default.searchMatch!.bg!,
          "editorGutter.background": orTransparent(editorStyles.gutter.bg!),
          "editorLineNumber.foreground": editorStyles.gutter.color!,
          "editorError.foreground": theme.colors.state.error.color,
          "editorWarning.foreground": theme.colors.state.warning.color,

          // Dropdown
          "dropdown.background": editorStyles.tooltip.bg!,
          "dropdown.foreground": editorStyles.tooltip.color!,

          // Widget
          "editorWidget.background": editorStyles.tooltip.bg!,
          "editorHoverWidget.background": editorStyles.tooltip.bg!,
          "editorHoverWidget.border": editorStyles.tooltip.borderColor!,

          // List
          "list.hoverBackground": theme.colors.state.hover.bg!,
          "list.activeSelectionBackground": editorStyles.tooltip.selectedBg!,
          "list.activeSelectionForeground": editorStyles.tooltip.selectedColor!,
          "list.inactiveSelectionBackground": editorStyles.tooltip.bg!,
          "list.inactiveSelectionForeground": editorStyles.tooltip.color!,
          "list.highlightForeground": theme.colors.state.info.color,

          // Input
          "input.background": inputStyles.bg!,
          "input.foreground": inputStyles.color!,
          "input.border": inputStyles.borderColor!,
          "inputOption.activeBorder":
            theme.colors.default.primary + theme.default.transparency!.high,
          "input.placeholderForeground": theme.colors.default.textSecondary,
          "inputValidation.infoBackground": theme.colors.state.info.bg!,
          "inputValidation.infoBorder": theme.colors.state.info.color,
          "inputValidation.warningBackground": theme.colors.state.warning.bg!,
          "inputValidation.warningBorder": theme.colors.state.warning.color,
          "inputValidation.errorBackground": theme.colors.state.error.bg!,
          "inputValidation.errorBorder": theme.colors.state.error.color,

          // Minimap
          "minimap.background": orTransparent(editorStyles.minimap.bg!),
          "minimap.selectionHighlight":
            editorStyles.minimap.selectionHighlight!,

          // Peek view
          "peekView.border": orTransparent(editorStyles.peekView.borderColor!),
          "peekViewTitle.background": editorStyles.peekView.title!.bg!,
          "peekViewTitleLabel.foreground":
            editorStyles.peekView.title!.labelColor!,
          "peekViewTitleDescription.foreground":
            editorStyles.peekView.title!.descriptionColor!,
          "peekViewEditor.background": editorStyles.peekView.editor!.bg!,
          "peekViewEditor.matchHighlightBackground":
            editorStyles.peekView.editor!.matchHighlightBg!,
          "peekViewEditorGutter.background":
            editorStyles.peekView.editor!.gutterBg!,
          "peekViewResult.background": editorStyles.peekView.result!.bg!,
          "peekViewResult.lineForeground":
            editorStyles.peekView.result!.lineColor!,
          "peekViewResult.fileForeground":
            editorStyles.peekView.result!.fileColor!,
          "peekViewResult.selectionBackground":
            editorStyles.peekView.result!.selectionBg!,
          "peekViewResult.selectionForeground":
            editorStyles.peekView.result!.selectionColor!,
          "peekViewResult.matchHighlightBackground":
            editorStyles.peekView.result!.matchHighlightBg!,
        },
        rules: [
          { token: "invalid", foreground: hl.invalid.color },
          { token: "emphasis", fontStyle: "italic" },

          { token: "variable", foreground: hl.variableName.color },
          { token: "variable.predefined", foreground: hl.variableName.color },
          { token: "variable.parameter", foreground: hl.functionArg.color },
          { token: "constant", foreground: hl.constant.color },
          { token: "comment", foreground: hl.lineComment.color },
          { token: "number", foreground: hl.integer.color },
          { token: "number.hex", foreground: hl.integer.color },
          { token: "regexp", foreground: hl.regexp.color },
          { token: "annotation", foreground: hl.annotion.color },
          { token: "type", foreground: hl.typeName.color },

          { token: "tag", foreground: hl.tagName.color },
          { token: "tag.id.pug", foreground: hl.tagName.color },
          { token: "tag.class.pug", foreground: hl.tagName.color },
          { token: "meta.tag", foreground: hl.meta.color },
          { token: "metatag", foreground: hl.meta.color },

          { token: "key", foreground: hl.keyword.color },
          { token: "string.key.json", foreground: hl.typeName.color },
          { token: "string.value.json", foreground: hl.string.color },

          { token: "attribute.name", foreground: hl.attributeName.color },
          { token: "attribute.value", foreground: hl.attributeValue.color },

          { token: "string", foreground: hl.string.color },

          { token: "keyword", foreground: hl.keyword.color },
          { token: "keyword.json", foreground: hl.moduleKeyword.color },
        ],
      });
      monaco.editor.setTheme(theme.name);
    } else {
      monaco.editor.setTheme("vs");
    }

    setIsThemeSet(true);
  }, [theme]);

  // Set font
  useEffect(() => {
    if (editor) editor.updateOptions({ fontFamily: theme.font.code.family });
  }, [editor, theme]);

  // Create editor
  useEffect(() => {
    if (editor || !isThemeSet || !monacoRef.current) return;

    setEditor(
      monaco.editor.create(monacoRef.current, {
        automaticLayout: true,
        // FIXME: Coloring is not working
        bracketPairColorization: { enabled: true },
        fontLigatures: true,
        tabSize: 2,
      })
    );
  }, [editor, isThemeSet]);

  // Set editor state
  useEffect(() => {
    if (!editor || !explorer) return;
    let topLineIntervalId: NodeJS.Timer;
    let model: monaco.editor.ITextModel | undefined;

    const switchFile = explorer.onDidSwitchFile(() => {
      // Clear previous state
      clearInterval(topLineIntervalId);
      model?.dispose();

      // Get current file
      const curFile = explorer.getCurrentFile();
      if (!curFile) return;

      // Open all parents
      PgExplorer.openAllParents(curFile.path);

      // Change selected
      // won't work on mount
      const newEl = PgExplorer.getElFromPath(curFile.path);
      if (newEl) PgExplorer.setSelectedEl(newEl);

      // Set editor model
      model = monaco.editor.createModel(
        curFile.content!,
        undefined,
        monaco.Uri.parse(curFile.path.replace(/\s*/g, ""))
      );
      editor.setModel(model);

      // Set language
      switch (explorer.getCurrentFileLanguage()) {
        case Lang.RUST: {
          monaco.editor.setModelLanguage(model, "rust");
          break;
        }

        case Lang.PYTHON: {
          monaco.editor.setModelLanguage(model, "python");
          break;
        }

        case Lang.JAVASCRIPT: {
          monaco.editor.setModelLanguage(model, "javascript");
          break;
        }

        case Lang.TYPESCRIPT: {
          monaco.editor.setModelLanguage(model, "typescript");
          break;
        }

        case Lang.JSON: {
          monaco.editor.setModelLanguage(model, "json");
        }
      }

      // Scroll to the top line number
      const topLineNumber = explorer.getEditorTopLineNumber(curFile.path);
      const pos = topLineNumber ? editor.getTopForLineNumber(topLineNumber) : 0;
      editor.setScrollTop(pos);

      // Save top line number
      topLineIntervalId = PgCommon.setIntervalOnFocus(() => {
        explorer.saveEditorTopLineNumber(
          curFile.path,
          editor.getVisibleRanges()[0].startLineNumber
        );
      }, 1000);
    });

    return () => {
      clearInterval(topLineIntervalId);
      model?.dispose();
      switchFile.dispose();
    };
  }, [editor, explorer]);

  // Auto save
  useEffect(() => {
    if (!editor || !explorer) return;
    const curFile = explorer?.getCurrentFile();
    if (!curFile) return;

    let timeoutId: NodeJS.Timeout;

    const disposable = editor.onDidChangeModelContent(() => {
      timeoutId && clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const args: [string, string] = [curFile.path, editor.getValue()];

        // Save to state
        explorer.saveFileToState(...args);

        // Save to IndexedDb
        explorer
          .saveFileToIndexedDB(...args)
          .catch((e: any) =>
            console.log(`Error saving file ${curFile.path}. ${e.message}`)
          );
      }, 500);
    });

    return () => {
      clearTimeout(timeoutId);
      disposable.dispose();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, explorer, explorerChanged]);

  // Editor custom events
  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => {
      if (!editor.hasTextFocus()) editor.focus();
    };

    document.addEventListener(EventName.EDITOR_FOCUS, handleFocus);
    return () => {
      document.removeEventListener(EventName.EDITOR_FOCUS, handleFocus);
    };
  }, [editor]);

  // Format event
  useEffect(() => {
    const handleEditorFormat = (
      e: UIEvent & { detail: { lang: Lang; fromTerminal: boolean } | null }
    ) => {
      PgTerminal.process(async () => {
        if (!editor || !explorer) return;

        const lang = explorer.getCurrentFileLanguage();
        if (!lang) return;

        let formatRust;
        const isCurrentFileRust = lang === Lang.RUST;
        if (isCurrentFileRust) {
          formatRust = async () => {
            const currentContent = editor.getValue();
            const model = editor.getModel();
            if (!model) return;

            const { rustfmt } = await PgPkg.loadPkg(PgPkg.RUSTFMT);

            let result;
            try {
              result = rustfmt!(currentContent);
            } catch (e: any) {
              result = { error: () => e.message };
            }
            if (result.error()) {
              PgTerminal.log(PgTerminal.error("Unable to format the file."));
              return;
            }

            if (e.detail?.fromTerminal) {
              PgTerminal.log(PgTerminal.success("Format successful."));
            }

            const pos = editor.getPosition();
            if (!pos) return;
            let cursorOffset = model.getOffsetAt(pos);
            const currentLine = model.getLineContent(pos.lineNumber);
            const beforeLine = model.getLineContent(pos.lineNumber - 1);
            const afterLine = model.getLineContent(pos.lineNumber + 1);
            const searchText = [beforeLine, currentLine, afterLine].reduce(
              (acc, cur) => acc + cur + "\n",
              ""
            );

            const formattedCode = result.code!();
            const searchIndex = formattedCode.indexOf(searchText);
            if (searchIndex !== -1) {
              // Check if there are multiple instances of the same searchText
              const nextSearchIndex = formattedCode.indexOf(
                searchText,
                searchIndex + searchText.length
              );
              if (nextSearchIndex === -1) {
                cursorOffset =
                  searchIndex +
                  cursorOffset -
                  model.getOffsetAt({
                    lineNumber: pos.lineNumber - 1,
                    column: 0,
                  });
              }
            }

            const endLineNumber = model.getLineCount();
            const endColumn = model.getLineContent(endLineNumber).length + 1;

            // Execute edits pushes the changes to the undo stack
            editor.executeEdits(null, [
              {
                text: formattedCode,
                range: {
                  startLineNumber: 1,
                  endLineNumber,
                  startColumn: 0,
                  endColumn,
                },
              },
            ]);

            const resultPos = model.getPositionAt(cursorOffset);
            editor.setPosition(resultPos);
          };
        }

        const isCurrentFileJsLike = explorer.isCurrentFileJsLike();
        let formatJSTS;
        if (isCurrentFileJsLike) {
          formatJSTS = async () => {
            const currentContent = editor.getValue();

            const model = editor.getModel();
            if (!model) return;

            const { formatWithCursor } = await import("prettier/standalone");
            const { default: parserTypescript } = await import(
              "prettier/parser-typescript"
            );

            const pos = editor.getPosition() ?? { lineNumber: 1, column: 0 };

            const result = formatWithCursor(currentContent, {
              parser: "typescript",
              plugins: [parserTypescript],
              cursorOffset: model.getOffsetAt(pos),
            });

            if (e.detail?.fromTerminal) {
              PgTerminal.log(PgTerminal.success("Format successful."));
            }

            const endLineNumber = model.getLineCount();
            const endColumn = model.getLineContent(endLineNumber).length + 1;

            // Execute edits pushes the changes to the undo stack
            editor.executeEdits(null, [
              {
                text: result.formatted,
                range: {
                  startLineNumber: 1,
                  endLineNumber,
                  startColumn: 0,
                  endColumn,
                },
              },
            ]);

            const resultPos = model.getPositionAt(result.cursorOffset);
            editor.setPosition(resultPos);
          };
        }

        const isCurrentFileJSON = lang === Lang.JSON;
        let formatJSON;
        if (isCurrentFileJSON) {
          formatJSON = () => {
            const model = editor.getModel();
            if (!model) return;

            const pos = editor.getPosition();
            if (!pos) return;
            let cursorOffset = model.getOffsetAt(pos);
            const currentLine = model.getLineContent(pos.lineNumber);
            const beforeLine = model.getLineContent(pos.lineNumber - 1);
            const afterLine = model.getLineContent(pos.lineNumber + 1);
            const searchText = [beforeLine, currentLine, afterLine].reduce(
              (acc, cur) => acc + cur + "\n",
              ""
            );

            const formattedCode = PgCommon.prettyJSON(
              JSON.parse(editor.getValue())
            );
            const searchIndex = formattedCode.indexOf(searchText);
            if (searchIndex !== -1) {
              // Check if there are multiple instances of the same searchText
              const nextSearchIndex = formattedCode.indexOf(
                searchText,
                searchIndex + searchText.length
              );
              if (nextSearchIndex === -1) {
                cursorOffset =
                  searchIndex +
                  cursorOffset -
                  model.getOffsetAt({
                    lineNumber: pos.lineNumber - 1,
                    column: 0,
                  });
              }
            }

            const endLineNumber = model.getLineCount();
            const endColumn = model.getLineContent(endLineNumber).length + 1;

            // Execute edits pushes the changes to the undo stack
            editor.executeEdits(null, [
              {
                text: formattedCode,
                range: {
                  startLineNumber: 1,
                  endLineNumber,
                  startColumn: 0,
                  endColumn,
                },
              },
            ]);

            const resultPos = model.getPositionAt(cursorOffset);
            editor.setPosition(resultPos);
          };
        }

        // From keybind
        if (!e.detail) {
          if (isCurrentFileRust) {
            formatRust && (await formatRust());
          } else if (isCurrentFileJsLike) {
            formatJSTS && (await formatJSTS());
          } else if (isCurrentFileJSON) {
            formatJSON && formatJSON();
          }

          return;
        }

        // From terminal
        switch (e.detail.lang) {
          case Lang.RUST: {
            if (!isCurrentFileRust) {
              PgTerminal.log(
                PgTerminal.warning("Current file is not a Rust file.")
              );
              return;
            }

            formatRust && (await formatRust());
            break;
          }

          case Lang.TYPESCRIPT: {
            if (!isCurrentFileJsLike) {
              PgTerminal.log(
                PgTerminal.warning("Current file is not a JS/TS file.")
              );
              return;
            }

            formatJSTS && (await formatJSTS());
          }
        }
      });
    };

    const handleFormatOnKeybind = (e: KeyboardEvent) => {
      if (PgCommon.isKeyCtrlOrCmd(e)) {
        const key = e.key.toUpperCase();
        if (key === "S") {
          e.preventDefault();
          if (editor?.hasTextFocus()) {
            PgCommon.createAndDispatchCustomEvent(EventName.EDITOR_FORMAT);
          }
        }
      }
    };

    document.addEventListener(
      EventName.EDITOR_FORMAT,
      handleEditorFormat as EventListener
    );
    document.addEventListener("keydown", handleFormatOnKeybind);
    return () => {
      document.removeEventListener(
        EventName.EDITOR_FORMAT,
        handleEditorFormat as EventListener
      );
      document.removeEventListener("keydown", handleFormatOnKeybind);
    };
  }, [editor, explorer]);

  // Set declarations
  useEffect(() => {
    if (!editor || !explorer) return;
    let declareOptionalsTimoutId: NodeJS.Timer;

    const declareOptionals = async () => {
      const { declareOptionalTypes } = await import("./declarations/optionals");
      await declareOptionalTypes(editor.getValue());
    };

    const switchFile = explorer.onDidSwitchFile(async () => {
      const { declareDefaultTypes } = await import("./declarations/defaults");
      await declareDefaultTypes();
      await declareOptionals();
      const { declareDisposableTypes } = await import(
        "./declarations/disposables"
      );
      await declareDisposableTypes();
    });

    const changeContent = editor.onDidChangeModelContent(async () => {
      clearTimeout(declareOptionalsTimoutId);
      declareOptionalsTimoutId = setTimeout(declareOptionals, 1000);
    });

    return () => {
      switchFile.dispose();
      clearTimeout(declareOptionalsTimoutId);
      changeContent.dispose();
    };
  }, [editor, explorer]);

  return <div ref={monacoRef} />;
};

export default Monaco;
