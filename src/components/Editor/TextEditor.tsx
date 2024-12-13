import React, { useEffect, useRef, useState } from "react";
import {
    EditorState,
    Editor,
    Modifier,
    RichUtils,
    getDefaultKeyBinding,
    convertToRaw,
    convertFromRaw,
    EditorCommand,
    DraftHandleValue,
} from "draft-js";
import "draft-js/dist/Draft.css";
import Title from "@/components/Title/Title";
import Button from "@/components/Button/Button";
import {
    SAVE_TEXT,
    EDITOR_CREATER_NAME,
    RULES,
    START_TYPING_TEXT,
} from "@/constants/index";

const TextEditor = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const editorRef = useRef<Editor>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedData = localStorage.getItem("editorData");
            if (savedData) {
                const contentState = convertFromRaw(JSON.parse(savedData));
                setEditorState(EditorState.createWithContent(contentState));
            }
        }
    }, []);

    const styleMap = {
        TEXT_COLOR: { color: "red" },
        HIGHLIGHT: { backgroundColor: "#CCFF33" },
    };

    const handleKeyBinding = (e: React.KeyboardEvent): string | null => {
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const blockKey = selectionState.getStartKey();
        const block = contentState.getBlockForKey(blockKey);
        const blockText = block.getText();
        const startOffset = selectionState.getStartOffset();

        if (e.key === " " && RULES.includes(blockText.slice(0, startOffset))) {
            return "space";
        }
        if (e.key === "Enter") {
            return "enter";
        }
        return getDefaultKeyBinding(e);
    };

    const removeInlineStyles = (state: EditorState): EditorState => {
        const currentStyle = state.getCurrentInlineStyle();
        let newEditorState = state;

        (currentStyle as unknown as string[]).forEach((style: string) => {
            newEditorState = RichUtils.toggleInlineStyle(newEditorState, style);
        });

        return newEditorState;
    };

    const handleKeyCommand = (command: EditorCommand, editorState: EditorState): DraftHandleValue => {
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const blockKey = selectionState.getStartKey();
        const block = contentState.getBlockForKey(blockKey);
        const blockText = block.getText();
        const startOffset = selectionState.getStartOffset();

        if (command === "space") {
            const leadingSymbols = blockText.slice(0, startOffset);
            const newContentState = Modifier.replaceText(
                contentState,
                selectionState.merge({ anchorOffset: 0, focusOffset: startOffset }),
                ""
            );

            let nextEditorState = EditorState.push(
                editorState,
                newContentState,
                "remove-range"
            );
            nextEditorState = RichUtils.toggleBlockType(nextEditorState, "unstyled");
            nextEditorState = removeInlineStyles(nextEditorState);

            switch (leadingSymbols) {
                case "#":
                    setEditorState(
                        RichUtils.toggleBlockType(nextEditorState, "header-one")
                    );
                    break;
                case "*":
                    setEditorState(RichUtils.toggleInlineStyle(nextEditorState, "BOLD"));
                    break;
                case "**":
                    setEditorState(
                        RichUtils.toggleInlineStyle(nextEditorState, "TEXT_COLOR")
                    );
                    break;
                case "***":
                    setEditorState(
                        RichUtils.toggleInlineStyle(nextEditorState, "UNDERLINE")
                    );
                    break;
                default:
                    const newContentStateWithSpace = Modifier.insertText(
                        contentState,
                        selectionState,
                        " "
                    );
                    setEditorState(
                        EditorState.push(
                            editorState,
                            newContentStateWithSpace,
                            "insert-characters"
                        )
                    );
                    break;
            }
            return "handled";
        }

        if (command === "enter") {
            const newContentState = Modifier.splitBlock(contentState, selectionState);
            let newEditorState = EditorState.push(
                editorState,
                newContentState,
                "split-block"
            );
            const newSelectionState = newEditorState.getSelection();
            newEditorState = RichUtils.toggleBlockType(
                EditorState.forceSelection(newEditorState, newSelectionState),
                "unstyled"
            );
            newEditorState = removeInlineStyles(newEditorState);
            setEditorState(newEditorState);
            return "handled";
        }

        return "not-handled";
    };

    const saveEditorContent = () => {
        const raw = convertToRaw(editorState.getCurrentContent());
        alert("Content saved!");
        if (typeof window !== "undefined") {
            localStorage.setItem("editorData", JSON.stringify(raw, null, 2));
        }
    };

    const focusEditor = () => {
        editorRef.current?.focus();
    };

    return (
        <div className="flex flex-col">
            <header className="flex justify-center items-center relative w-full p-4 bg-gray-100 border-b border-gray-300">
                <div className="flex-1 text-center">
                    <Title name={EDITOR_CREATER_NAME} />
                </div>
                <div className="align-middle self-center flex-shrink-0">
                    <Button onClick={saveEditorContent}>{SAVE_TEXT}</Button>
                </div>
            </header>
            <main className="m-[8vh_20vw] border-2 border-lightskyblue min-h-[60vh] p-4" onClick={focusEditor}>
                <Editor
                    ref={editorRef}
                    placeholder={START_TYPING_TEXT}
                    customStyleMap={styleMap}
                    editorState={editorState}
                    onChange={setEditorState}
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={handleKeyBinding}
                />
            </main>
        </div>
    );
};

export default TextEditor;
