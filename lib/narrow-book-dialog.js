"use babel";

import React, { useState, useEffect } from "react";
import { Dropdown } from "semantic-ui-react";
import { useModal } from "inkdrop";

const NarrowBookDialog = (_) => {
  const { Dialog } = inkdrop.components.classes;
  const modal_ = useModal();
  const [options_, setOptions] = useState([]);
  /*
   *
   */
  const open = () => {
    buildBooks();

    // set menu's height
    const height = document.querySelector(".editor").clientHeight;
    document.documentElement.style.setProperty(
      "--narrow-book-menu-height",
      (height - 100).toString(10) + "px"
    );
    document.documentElement.style.setProperty(
      "--narrow-book-dialog-margin-top",
      (-1 * height + 100).toString(10) + "px"
    );

    modal_.show();
  };
  /*
   *
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

    // how to focus? wait for ui
    setTimeout(() => {
      const ele = document.querySelector(".narrow-book-dropdown input");
      if (ele != null) {
        ele.focus();
      }
    }, 100);
  });
  /*
   *
   */
  const handleOnChange = (_, data) => {
    close();
    // All Notes or book
    if (document.querySelector(".sidebar-menu-item-all-notes") == data.value) {
      document.querySelector(".back-button").click();
      data.value.click();
    } else {
      data.value.querySelector(".disclosure-label").click();
    }
    setTimeout(() => invoke("editor:focus"), 1000);
  };
  /*
   *
   */
  const handleKeyDown = (ev) => {
    const nev = ev.nativeEvent;

    if (nev.key == "Escape") {
      close();
    }

    if (!nev.ctrlKey) {
      return;
    }
    // delete word (clear)
    if (nev.key == "w") {
      nev.srcElement.value = "";
      return;
    }

    let first = -1;
    // check keyCode
    if (nev.key == "n") {
      first = 40;
    } else if (nev.key == "p") {
      first = 38;
    }

    // fire
    if (first > 0) {
      document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: first }));
      nev.cancelBubble = true;
      nev.preventDefault();
    }
  };
  /*
   *
   */
  const buildBooks = () => {
    let options = [];
    let nodes = document.querySelectorAll(".sidebar-menu-book-list-item");
    let key = 0;
    const secondNodeWith = "32px";

    const notes = {};

    nodes.forEach((node) => {
      let text = node.querySelector(".content").innerText;
      if (notes[text] != null) {
        return;
      }
      notes[text] = text;
      if (node.style.paddingLeft == secondNodeWith) {
        text = "　" + text;
      }
      options.push({
        key,
        text,
        value: node,
      });
      key++;
    });

    let all = document.querySelector(".sidebar-menu-item-all-notes");
    options.push({
      key,
      text: all.querySelector(".content").innerText,
      value: all,
    });

    setOptions(options);
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
        <Dropdown
          className="narrow-book-dropdown"
          placeholder="Select Notebook"
          selectOnNavigation={false}
          options={options_}
          onChange={handleOnChange}
          searchInput={
            <Dropdown.SearchInput
              className="ui input"
              onKeyDown={handleKeyDown.bind(this)}
            />
          }
          fluid
          selection
          search
        />
      </Dialog.Content>
    </Dialog>
  );
};

export default NarrowBookDialog;
