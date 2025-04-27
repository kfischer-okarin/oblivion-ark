# Development Tools
- Run `just fix` after applying changes to fix the code format. NEVER spend time on fixing format issues yourself.
- Check commit diff: `git --no-pager show <commit>`

# Coding style
## Methods / Functions
- Don't use comments to explain what parts of methods do - instead if a method becomes too long to understand at a glance, extract a private method
- Name functions/methods after *what* they do in the context when they would be called (after *how* they do it)
  - In case of methods (i.e. being sent to objects/classes/etc) make the name either a command/request about what you want the receiver to do for you or a query about some information it can tell you
    - When designing object interacitons prefer commands over queries methods to achieve your goal where possible
- Query methods should never have side effects

## Values / Objects
- Use immutable value objects whereever it makes sense
- Make invalid values unrepresentable

## Application logic
- Application endpoints (i.e. logic that is triggered via user interaction or via external events) should follow a simple imperative style:
  - Convert values from external sources (direct endpoint input values, data retrieved from external data sources) into meaningful domain values/objects as soon as possible
    - This conversion step should act as validation at the same time. Once the value is converted to a domain value it should be assumed to be a valid value (as invalid values should be not be representable)
  - Clearly separate statements with side effects (data retrieval/storage, external API calls) and from statements with pure domain calculations
- Encapsulate everything that accesses an external system in anyway into a interface that only describes the *what* of the service that the application logic requires without giving any indication to what kind actual implementation/system might be behind it
- Do not use exceptions for control flow; reserve them for exceptional circumstances where assumptions the code relied on turn out to be false or violated

## Testing
- Use the Arrange-Act-Assert pattern and use one empty line to separate those sections

## Javascript
- Prefer `await` style async functions over Promise chaining with `then`