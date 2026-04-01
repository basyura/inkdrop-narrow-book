"use babel";

import React, { useState, useEffect, useRef } from "react";
import { useModal } from "inkdrop";
import migemo from "jsmigemo";
import fs from "fs";

const NarrowBookDialog = (_) => {
  const { Dialog } = inkdrop.components.classes;
  const modal_ = useModal();
  const inputRef_ = useRef(null);
  const [options_, setOptions] = useState([]);
  const [query_, setQuery] = useState("");
  const [selectedIndex_, setSelectedIndex] = useState(0);
  let isClosing_ = false;
  let jsm_ = null;

  const dictPath = inkdrop.config.get("narrow-book.migemoDictPath");
  if (dictPath != "" && fs.existsSync(dictPath)) {
    const buf = fs.readFileSync(dictPath);
    const dict = new migemo.CompactDictionary(buf.buffer);
    jsm_ = new migemo.Migemo();
    jsm_.setDict(dict);
  }
  /*
   *
   */
  const open = () => {
    // create options
    const options = buildBooks();
    setOptions(options);
    setQuery("");
    setSelectedIndex(0);

    // set menu's height
    applyProperties();

    // show dialog
    modal_.show();
  };
  /*
   * register command
   */
  useEffect(() => {
    const sub = inkdrop.commands.add(document.body, {
      "narrow-book:open": () => open(),
    });
    return () => sub.dispose();
  }, [open]);
  /*
   *
   */
  useEffect(() => {
    // check state
    if (!modal_.state.visible) {
      return;
    }

    setTimeout(() => {
      if (inputRef_.current != null) {
        inputRef_.current.focus();
      }
    }, 100);
  });
  /*
   *
   */
  const handleOnChange = (_, data) => {
    if (isClosing_) {
      return;
    }
    isClosing_ = true;
    close();

    if (data.value == "all") {
      const backButton = document.querySelector(".back-button");
      if (backButton == null) {
        return;
      }
      backButton.click();
      setTimeout(() => {
        document.querySelector(".sidebar-menu-item-content .content").click();
        setTimeout(() => invoke("editor:focus"), 1000);
      }, 500);
      return;
    }

    let nodes = document.querySelectorAll(".sidebar-menu-book-list-item");
    for (let node of nodes) {
      let text = node.querySelector(".content").innerText;
      if (text == data.value) {
        node.querySelector(".disclosure-label").click();
        setTimeout(() => invoke("editor:focus"), 1000);
        return;
      }
    }

    document.querySelector(".back-button").click();

    setTimeout(() => {
      isClosing_ = false;
      handleOnChange(null, data);
    }, 500);
  };
  /*
   *
   */
  const handleKeyDown = (ev) => {
    const nev = ev.nativeEvent;
    const filtered = searchNotes(options_, query_);

    if (nev.key == "Escape") {
      close();
      return;
    }

    if (nev.key == "ArrowDown") {
      if (filtered.length > 0) {
        setSelectedIndex((index) => Math.min(index + 1, filtered.length - 1));
      }
      nev.preventDefault();
      return;
    }

    if (nev.key == "ArrowUp") {
      if (filtered.length > 0) {
        setSelectedIndex((index) => Math.max(index - 1, 0));
      }
      nev.preventDefault();
      return;
    }

    if (nev.key == "Enter") {
      const option = filtered[selectedIndex_];
      if (option != null) {
        handleOnChange(null, { value: option.value });
        nev.preventDefault();
      }
      return;
    }

    if (!nev.ctrlKey) {
      return;
    }
    // delete word (clear)
    if (nev.key == "w") {
      setQuery("");
      setSelectedIndex(0);
      nev.preventDefault();
      return;
    }

    if (nev.key == "n") {
      if (filtered.length > 0) {
        setSelectedIndex((index) => Math.min(index + 1, filtered.length - 1));
      }
      nev.cancelBubble = true;
      nev.preventDefault();
      return;
    } else if (nev.key == "p") {
      if (filtered.length > 0) {
        setSelectedIndex((index) => Math.max(index - 1, 0));
      }
      nev.cancelBubble = true;
      nev.preventDefault();
    }
  };
  /*
   *
   */
  const buildBooks = () => {
    const { books } = inkdrop.store.getState();

    let options = convertToOptions(books.all);
    // add "All Notes"
    let all = document.querySelector(".sidebar-menu-item-all-notes");
    options.push({
      key: "all",
      text: all.querySelector(".content").innerText,
      value: "all",
      node: all,
    });

    return options;
  };
  /*
   *
   */
  const convertToOptions = (books, parentId = null, indent = "") => {
    let result = [];
    books
      .filter((book) => book.parentBookId === parentId)
      .forEach((book) => {
        result.push({
          key: book._id,
          value: book.name,
          text: indent + book.name,
        });
        const children = convertToOptions(books, book._id, indent + "　　");
        result = result.concat(children);
      });
    return result;
  };
  /*
   *
   */
  const applyProperties = () => {
    const editor = document.querySelector(".editor");
    if (editor == null) {
      return;
    }
    const height = editor.clientHeight;
    // menu's height
    document.documentElement.style.setProperty(
      "--narrow-book-menu-height",
      Math.max(height - 260, 180).toString(10) + "px"
    );
  };
  /*
   *
   */
  const searchNotes = (options, query) => {
    query = query.toLowerCase();
    // include
    if (jsm_ == null) {
      return options.filter((option) =>
        option.text.toLowerCase().includes(query)
      );
    }

    // use migemo
    let targets = [];
    let queries = query.split(" ");
    for (let i = 0; i < queries.length; i++) {
      const regex = new RegExp(jsm_.query(queries[i]));
      options.forEach((option) => {
        const text = option.text.toLowerCase();
        if (regex.test(text)) {
          targets.push(option);
        }
      });
    }
    return targets;
  };
  /*
   *
   */
  const close = () => {
    modal_.close();
    invoke("editor:focus");
  };
  /*
   *
   */
  const filteredOptions_ = searchNotes(options_, query_);
  /*
   *
   */
  const invoke = (cmd, param, ele) => {
    if (ele == null) {
      ele = document.body;
    }
    if (param == null) {
      param = {};
    }
    inkdrop.commands.dispatch(ele, cmd, param);
  };
  /*
   *
   */
  return (
    <Dialog
      {...modal_.state}
      onBackdropClick={close}
      hiding={false}
      className="narrow-book-dialog"
    >
      <Dialog.Content>
        <div className="narrow-book-dropdown">
          <input
            ref={inputRef_}
            className="narrow-book-input"
            placeholder="Select Notebook"
            value={query_}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="narrow-book-menu">
            {filteredOptions_.map((option, index) => (
              <button
                key={option.key}
                type="button"
                className={
                  "narrow-book-option" +
                  (index === selectedIndex_ ? " is-active" : "")
                }
                onClick={() => handleOnChange(null, { value: option.value })}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export default NarrowBookDialog;
