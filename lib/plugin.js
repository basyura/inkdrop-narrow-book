"use babel";

import NarrowBookDialog from "./narrow-book-dialog";

module.exports = {
  activate() {
    inkdrop.components.registerClass(NarrowBookDialog);
    inkdrop.layouts.addComponentToLayout("modal", "NarrowBookDialog");
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout("modal", "NarrowBookDialog");
    inkdrop.components.deleteClass(NarrowBookDialog);
  },
};
