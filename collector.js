(function (w) {
  w.uwConfig = {
    host: `${w.location.protocol}//${w.location.host}`,
    target: "http://127.0.0.1:4000"
  };

  const style = document.createElement("STYLE");
  style.innerHTML = `.uw-high-contrast {
  border: 2px solid fuchsia !important; 
  box-shadow: 0 0 2px !important
} 
.uw-high-contrast * {
  background: #fff !important;
  color: fuchsia !important;
  border-color: fuchsia !important;
  outline-color: fuchsia !important;
}
.uw-high-contrast ::placeholder {
  color: fuchsia !important;
}
`;
  w.document.head.appendChild(style);

  const frm = document.createElement("IFRAME");
  frm.style = "border:1px solid #000;width:100%;position:fixed;right:0;top:0;width:400px;height:400px;z-index:10";
  w.document.body.appendChild(frm);

  let nodesList = [];
  const highlightClass = "uw-high-contrast";

  frm.onload = () => {
    nodesList = generateAndPostTree();
  };
  frm.src = `${w.uwConfig.target}?d=${w.location.origin}`;

  const onDomChange = (mutationsList, observer) => {
    for(const mutation of mutationsList) {
      if ("childList" === mutation.type) {
        // we could add searching and updating the only changed nodes here
        // for now I'm just re-generate the complete DOM tree
        nodesList = generateAndPostTree();
        return;
      }
    }
  };
  const domObserver = new MutationObserver(onDomChange);
  domObserver.observe(w.document.body, {attributes: false, childList: true, subtree: true})

  w.addEventListener("message", (...data) => {
    if ("uw_highlight" === data[0].data.type) {
      highlightNode(+data[0].data.value);
    }
  });

  function generateAndPostTree() {
    let id = 1;
    const allNodes = [];
    allNodes.push({ id: 0, node: document.body, children: [] });
    const domTree = {body: {
        id: 0,
        node: document.body,
        children: []
      }};
    getNodes(domTree.body);
    domTree.body.node = "body";

    frm.contentWindow.postMessage({type: "uw_dom_tree", value: domTree}, w.uwConfig.target);
    return allNodes;

    function getNodes(nodeObj) {
      const nodes = [...nodeObj.node.children].filter(el => {
        return el.nodeType === 1 && el.type !== "hidden"
          && 0 > ["script", "noscript", "frame", "iframe"].indexOf(el.tagName.toLowerCase());
      });
      nodes.map(node => {
        const newNode = {
          id: id++,
          node,
          children: []
        };
        allNodes.push(newNode);

        const treeNode = {...newNode};
        treeNode.node = `${node.tagName.toLowerCase()}${node.id ? "#" + node.id : ""}${!node.className || "string" !== typeof node.className ? "" : "." + node.className.replace(/\ +/gim, ".")}`;
        nodeObj.children.push(treeNode);
        getNodes(newNode);
      });
    }
  }

  function highlightNode(nodeId = 0, node = null) {
    if (!nodeId && !node) {
      return;
    }

    let targetNode;
    if (nodeId && nodesList.length > nodeId) {
      targetNode = nodesList.find((n) => n.id === nodeId);
    } else {
      targetNode = {node};
    }
    if (!targetNode.node) {
      return;
    }

    if (targetNode.node && targetNode.node.classList) {
      [...w.document.querySelectorAll(".uw-high-contrast")].map(el => el.classList.remove(highlightClass));
      targetNode.node.classList.add(highlightClass);
      targetNode.node.scrollIntoView();
    }
  }
})(window);
