if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function showPage(pageId) {
  const sections = document.querySelectorAll("main section");
  const buttons = document.querySelectorAll(".tab-nav button");

  sections.forEach((section) => section.classList.remove("active"));
  buttons.forEach((btn) => btn.classList.remove("active"));

  document.getElementById(pageId).classList.add("active");

  const btn = document.querySelector(
  `.tab-nav button[data-page="${pageId}"]`
);
if (btn) btn.classList.add("active");
}

document.querySelectorAll(".tab-nav button").forEach(button => {
  button.addEventListener("click", () => {
  const page = button.dataset.page;
  showPage(page);

  if (page === "visual") {
    setTimeout(showFamilyTree, 100);
  }
});
});

let familyTree = {
  id: "buyut-hasyim",
  name: "Hasyim",
  role: "Buyut",
  image: "images/buyut.jpg",
  children: [
    {
      id: "istri-buyut-salma",
      name: "Salma binti Amr",
      role: "Buyut",
      image: "images/istribuyut.jpg",
      children: []
    },
    {
      id: "kakek-abdul-muthalib",
      name: "Abdul Muthalib",
      role: "Kakek",
      image: "images/kakek.jpg",
      children: [
        {
          id: "nenek-fatimah",
          name: "Fatimah binti Amr",
          role: "Nenek",
          image: "images/nenek.jpg",
          children: []
        },
        {
          id: "ayah-abdullah",
          name: "Abdullah",
          role: "Ayah",
          image: "images/ayah.jpg",
          children: [
            {
              id: "ibu-aminah",
              name: "Aminah binti Wahb",
              role: "Ibu",
              image: "images/ibu.jpg",
              children: []
            },
            {
              id: "root-nabi",
              name: "Nabi Muhammad ﷺ",
              role: "Anak",
              image: "images/nabi.jpg",
              children: []
            }
          ]
        }
      ]
    }
  ]
};

function showFamilyTree() {
  document.getElementById("treeContainer").innerHTML = "";
  renderTreantTree();
  updateTreeInfo();
}

//Lv. 4
function addNode(currentNode, parentName, newNode) {
  if (normalize(currentNode.name) === normalize(parentName)) {
    currentNode.children.push(newNode);
    return true;
  }

  for (let child of currentNode.children) {
    if (addNode(child, parentName, newNode)) {
      return true;
    }
  }

  return false;
}

const form = document.getElementById("familyForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nameInput = document.getElementById("name");
  const roleInput = document.getElementById("role");
  const parentInput = document.getElementById("parent");
  const photoInput = document.getElementById("photo");

  const name = capitalizeWords(nameInput.value);
  const role = capitalizeWords(roleInput.value);
  const parent = capitalizeWords(parentInput.value);
  const file = photoInput.files[0];

  if (!file) {
    alert("Foto wajib diupload");
    return;
  }

  if (file.type !== "image/jpeg") {
    alert("Hanya file JPG yang diperbolehkan");
    return;
  }

  if (file.size > 100 * 1024) {
    alert("Ukuran gambar maksimal 100 KB");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const newNode = {
      id: Date.now().toString(),
      name,
      role,
      image: reader.result ? reader.result : "images/default-node.jpg",
      children: []
    };

    const success = addNode(familyTree, parent, newNode);
    if (!success) {
      alert("Parent tidak ditemukan");
      return;
    }

    saveTree();
    showFamilyTree();
    form.reset();
    alert("Node berhasil ditambahkan!");
  };

  reader.readAsDataURL(file);
});

const STORAGE_KEY = "familyTreeData";

function saveTree() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(familyTree));
}

function loadTree() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    familyTree = JSON.parse(data);
  } else {
    saveTree();
  }
}

function countNodes(node) {
  let count = 1; 
  if (node.children) {
    node.children.forEach(child => {
      count += countNodes(child);
    });
  }
  return count;
}

function getDepth(node) {
  if (!node.children || node.children.length === 0) {
    return 1;
  }
  const depths = node.children.map(child => getDepth(child));
  return 1 + Math.max(...depths);
}

function updateTreeInfo() {
  document.getElementById("nodeCount").textContent = countNodes(familyTree);
  document.getElementById("treeDepth").textContent = getDepth(familyTree) - 1;
}

function deleteNode(parent, target) {
  for (let i = 0; i < parent.children.length; i++) {
    if (normalize(parent.children[i].name) === normalize(target)) {
      parent.children.splice(i, 1);
      return true;
    } else {
      if (deleteNode(parent.children[i], target)) {
        return true;
      }
    }
  }
  return false;
}

function deleteNodeById(targetId) {
  if (targetId === familyTree.id) {
    alert("Root data tidak boleh dihapus karena merupakan pusat struktur tree");
    return;
  }
  if (!confirm("Hapus node ini beserta turunannya?")) return;

  function recursiveDelete(parent) {
    parent.children = parent.children.filter(child => {
      if (child.id === targetId) return false;
      recursiveDelete(child);
      return true;
    });
  }

  recursiveDelete(familyTree);
  saveTree();
  showFamilyTree();
}

function editNodeById(targetId) {
  function findNode(node) {
    if (node.id === targetId) return node;
    for (let child of node.children || []) {
      const found = findNode(child);
      if (found) return found;
    }
    return null;
  }

  const node = findNode(familyTree);
  if (!node) {
    alert("Node tidak ditemukan");
    return;
  }

  const newName = prompt("Edit Nama:", node.name);
  if (!newName) return;

  const newRole = prompt("Edit Role:", node.role);
  if (!newRole) return;

  node.name = capitalizeWords(newName);
  node.role = capitalizeWords(newRole);

  saveTree();
  showFamilyTree();
}

function convertToTreant(node, isRoot = false) {
  let nodeClass;

  if (isRoot) {
    nodeClass = "node-root";      
  } else if (node.children && node.children.length > 0) {
    nodeClass = "node-parent";       
  } else {
    nodeClass = "node-leaf";       
  }

  let html = `
    <div class="treant-node ${nodeClass}">
      <div class="node-actions">
        <button class="edit-btn" onclick="editNodeById('${node.id}')">✏️</button>
        <button class="delete-btn" onclick="deleteNodeById('${node.id}')">🗑️</button>
      </div>

      <img src="${node.image}" />
      <strong>${node.name}</strong><br/>
      <small>${node.role}</small>
    </div>
  `;

  let treantNode = { innerHTML: html };

  if (node.children && node.children.length > 0) {
    treantNode.children = node.children.map(child =>
      convertToTreant(child, false)
    );
  }

  return treantNode;
}


function normalize(str) {
  return str.trim().toLowerCase();
}

function capitalizeWords(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

function renderTreantTree() {
  document.getElementById("treeContainer").innerHTML = "";

  const chartConfig = {
    chart: {
      container: "#treeContainer",
      rootOrientation: "NORTH",
      nodeAlign: "CENTER",
      levelSeparation: 70,
      siblingSeparation: 50,
      subTeeSeparation: 60,
      connectors: { type: "step" },
      node: { HTMLclass: "treant-node" }
    },
    nodeStructure: convertToTreant(familyTree, true)
  };

  new Treant(chartConfig);
}


document.addEventListener("DOMContentLoaded", () => {
  loadTree();
  showPage("about");
  showFamilyTree();
  
});

let resizeTimeout;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    showFamilyTree();
  }, 300);
});

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});
