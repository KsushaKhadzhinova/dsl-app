class DslSyntaxError(Exception):
    """Ошибка синтаксического разбора DSL — несёт позицию для подсветки в редакторе."""

    def __init__(self, message: str, line: int, column: int) -> None:
        super().__init__(message)
        self.message = message
        self.line = line
        self.column = column
