"use babel";

import React, { useState, useEffect } from "react";
import { Dropdown } from "semantic-ui-react";
import { useModal } from "inkdrop";

const NarrowBookDialog = (_) => {
  const { Dialog } = inkdrop.components.classes;
  const modal_ = useModal();
  const [options_, setOptions] = useState([]);
  let isClosing_ = false;
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
    const { books } = inkdrop.store.getState();
    let options = books.all.map(({ _id, name }) => ({
      key: _id,
      value: name,
      text: name,
    }));

    let all = document.querySelector(".sidebar-menu-item-all-notes");
    options.push({
      key: "all",
      text: all.querySelector(".content").innerText,
      value: "all",
      node: all,
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
