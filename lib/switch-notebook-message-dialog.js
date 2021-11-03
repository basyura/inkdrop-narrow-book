"use babel";

import React from "react";
import { CompositeDisposable } from "event-kit";
import { Dropdown } from "semantic-ui-react";

export default class SwitchNotebookMessageDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { options: [], bookId: "" };
  }

  componentWillMount() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      inkdrop.commands.add(document.body, {
        "switch-notebook:open": () => this.open(),
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  open() {
    this.refs.dropdown.state.value = "";
    // メインブック(book)に戻ることが多いので 0 をセット
    this.refs.dropdown.setSelectedIndex(0);
    this.buildBooks();
    this.refs.dialog.showDialog();
  }

  buildBooks(_options, _query) {
    let options = [];
    let nodes = document.querySelectorAll(".sidebar-menu-book-list-item");
    let key = 0;
    const secondNodeWith = "32px";

    nodes.forEach((node) => {
      let text = node.querySelector(".content").innerText;
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

    this.setState({ options });
  }

  handleOnChange = (_, data) => {
    // All Notes or book
    if (document.querySelector(".sidebar-menu-item-all-notes") == data.value) {
      document.querySelector(".back-button").click();
      data.value.click();
    } else {
      data.value.querySelector(".disclosure-label").click();
    }
    this.refs.dialog.dismissDialog();
    setTimeout(
      () => inkdrop.commands.dispatch(document.body, "editor:focus"),
      1000
    );
  };

  handleKeyDown(ev) {
    const nev = ev.nativeEvent;
    if (!nev.ctrlKey) {
      return;
    }
    // delete word (clear)
    if (nev.key == "w") {
      this.refs.dropdown.clearSearchQuery();
      return;
    }

    let first = -1;
    let second = -1;
    // check keyCode
    if (nev.key == "n") {
      first = 40;
      second = 38;
    } else if (nev.key == "p") {
      first = 38;
      second = 40;
    }
    // fire
    if (first > 0) {
      document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: first }));
      // to scroll into view
      setTimeout(() =>
        document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: first }))
      );
      setTimeout(() =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { keyCode: second })
        )
      );
      nev.cancelBubble = true;
      nev.preventDefault();
    }
  }

  render() {
    const { MessageDialog } = inkdrop.components.classes;
    return (
      <MessageDialog
        ref="dialog"
        title="Switch Notebook"
        buttons={[]}
        modalSettings={{ autofocus: true }}
      >
        <Dropdown
          ref="dropdown"
          options={this.state.options}
          placeholder="Select notebook"
          onChange={this.handleOnChange}
          searchInput={
            <Dropdown.SearchInput
              className="ui input"
              onKeyDown={this.handleKeyDown.bind(this)}
            />
          }
          selectOnNavigation={false}
          fluid
          selection
          search
        />
      </MessageDialog>
    );
  }
}
