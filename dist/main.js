const trustedDomain = window.location.search.substr(1).split("=")[1];

window.addEventListener("message", (...data) => {
  if ("uw_dom_tree" === data[0].data.type) {
    const branch = document.createElement("UL");
    document.body.innerHTML = "";
    document.body.appendChild(branch);
    buildDomTree(data[0].data.value.body.children, branch);
  }
});

document.addEventListener("click", (event) => {
  const el = event.currentTarget.activeElement;
  if ("a" === el.tagName.toLowerCase()) {
    event.preventDefault();
    const nodeId = el.id.split("_")[1];
    window.parent.postMessage({type: "uw_highlight", value: nodeId}, trustedDomain);
  }
});

function buildDomTree(nodesList, parentNode) {
  nodesList.map(treeNodeObj => {
    const elem = document.createElement("LI");
    const link = document.createElement("A");
    link.href = "#";
    link.title = treeNodeObj.node;
    link.id = `node_${treeNodeObj.id}`;
    link.innerText = treeNodeObj.node;
    elem.appendChild(link);
    parentNode.appendChild(elem);

    if (treeNodeObj.children && treeNodeObj.children.length) {
      const branch = document.createElement("UL");
      elem.appendChild(branch);
      buildDomTree(treeNodeObj.children, branch);
    }
  });
}
