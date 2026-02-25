export type OperationType = 'query' | 'mutation' | 'subscription';

/** A GraphQL variable definition, e.g. `$id: ID!` */
export interface VariableDefinition {
  name: string;
  /** GraphQL type string, e.g. `"ID!"`, `"String"`, `"[Int!]!"` */
  type: string;
}

/** A field that has sub-selections (and optional inline arguments) */
export interface FieldNode {
  name: string;
  /** Map of argument name → variable reference, e.g. `{ id: '$id' }` */
  args?: Record<string, string>;
  fields: FieldSelection[];
}

/** Either a scalar field name or a nested field with sub-selections */
export type FieldSelection = string | FieldNode;

/** A fully typed GraphQL request payload ready to POST */
export interface GraphQLRequest<TVariables = Record<string, unknown>> {
  query: string;
  variables?: TVariables;
}

/**
 * Fluent builder that assembles a GraphQL operation string.
 *
 * @example
 * const query = new GraphQLQueryBuilder()
 *   .operation('query', 'GetUser')
 *   .withVariable('id', 'ID!')
 *   .select({ name: 'user', args: { id: '$id' }, fields: ['id', 'name', 'email'] })
 *   .build();
 */
export class GraphQLQueryBuilder {
  private _type: OperationType = 'query';
  private _name = '';
  private _variables: VariableDefinition[] = [];
  private _fields: FieldSelection[] = [];

  /** Set the operation type and optional name */
  operation(type: OperationType, name = ''): this {
    this._type = type;
    this._name = name;
    return this;
  }

  /** Declare a variable used in the operation, e.g. `withVariable('id', 'ID!')` */
  withVariable(name: string, type: string): this {
    this._variables.push({ name, type });
    return this;
  }

  /** Add one or more top-level field selections */
  select(...fields: FieldSelection[]): this {
    this._fields.push(...fields);
    return this;
  }

  /** Produce the final GraphQL operation string */
  build(): string {
    const varDefs = this._variables.map((v) => `$${v.name}: ${v.type}`).join(', ');
    const nameWithVars = [this._name, varDefs ? `(${varDefs})` : ''].filter(Boolean).join('');
    const signature = [this._type, nameWithVars].filter(Boolean).join(' ');
    const body = this._fields.map((f) => renderField(f, 1)).join('\n');
    return `${signature} {\n${body}\n}`;
  }
}

function renderField(field: FieldSelection, depth: number): string {
  const pad = '  '.repeat(depth);
  if (typeof field === 'string') {
    return `${pad}${field}`;
  }
  const args = field.args
    ? `(${Object.entries(field.args)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')})`
    : '';
  const subfields = field.fields.map((f) => renderField(f, depth + 1)).join('\n');
  return `${pad}${field.name}${args} {\n${subfields}\n${pad}}`;
}
