"""Лексер и синтаксический анализ DSL на Lark, сборка в DiagramModel (app/domain/graph.py).
Чистый Python: не зависит ни от FastAPI, ни от БД — тестируется как есть (см. tests/test_parser.py)."""

from pathlib import Path

from lark import Lark, Token, Tree
from lark.exceptions import UnexpectedInput

from app.domain.graph import DiagramModel, Edge, Node
from app.dsl.errors import DslSyntaxError

_GRAMMAR_PATH = Path(__file__).parent / "grammar.lark"
_parser = Lark(_GRAMMAR_PATH.read_text(encoding="utf-8"), parser="earley", propagate_positions=True)


def _unquote(token: Token) -> str:
    return str(token)[1:-1]


def parse(dsl_code: str) -> DiagramModel:
    try:
        tree = _parser.parse(dsl_code)
    except UnexpectedInput as exc:
        raise DslSyntaxError(
            message=f"Синтаксическая ошибка: {exc}",
            line=getattr(exc, "line", 1),
            column=getattr(exc, "column", 1),
        ) from exc

    notation = str(tree.children[0])
    title = _unquote(tree.children[1])

    nodes: list[Node] = []
    edges: list[Edge] = []
    edge_counter = 0

    for statement in tree.children[2:]:
        if not isinstance(statement, Tree):
            continue

        if statement.data == "node_decl":
            kind_tok, id_tok, label_tok, *attr_trees = statement.children
            attributes = {}
            for attr_tree in attr_trees:
                key_tok, value_tok = attr_tree.children
                attributes[str(key_tok)] = (
                    _unquote(value_tok) if value_tok.type == "STRING" else str(value_tok)
                )
            nodes.append(
                Node(id=str(id_tok), kind=str(kind_tok), label=_unquote(label_tok), attributes=attributes)
            )

        elif statement.data == "edge_stmt":
            current_id = str(statement.children[0])
            for hop in statement.children[1:]:
                arrow_tok, target_tok = hop.children
                label = ""
                if arrow_tok.type == "COND_ARROW":
                    label = str(arrow_tok).split('"')[1]
                edge_counter += 1
                edges.append(
                    Edge(
                        id=f"e{edge_counter}",
                        kind="flow",
                        source_id=current_id,
                        target_id=str(target_tok),
                        label=label,
                    )
                )
                current_id = str(target_tok)

    return DiagramModel(notation=notation, title=title, nodes=tuple(nodes), edges=tuple(edges))
