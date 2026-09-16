let diagrams = [];
let nextId = 1;

function reset() {
  diagrams = [];
  nextId = 1;
}

function findAll() {
  return diagrams;
}

function findById(id) {
  return diagrams.find((diagram) => diagram.id === id);
}

function create({ title, notation, dslContent }) {
  const diagram = {
    id: nextId++,
    title,
    notation,
    dslContent: dslContent || "",
    createdAt: new Date().toISOString(),
  };
  diagrams.push(diagram);
  return diagram;
}

module.exports = { reset, findAll, findById, create };
