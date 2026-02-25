import { GraphQLQueryBuilder } from './graphql-query-builder';

describe('GraphQLQueryBuilder', () => {
  it('should build an anonymous query', () => {
    const result = new GraphQLQueryBuilder().operation('query').select('viewer').build();
    expect(result).toMatch(/^query \{/);
    expect(result).toContain('viewer');
  });

  it('should build a named query with top-level scalar fields', () => {
    const result = new GraphQLQueryBuilder()
      .operation('query', 'GetUsers')
      .select('id', 'name', 'email')
      .build();
    expect(result).toContain('query GetUsers {');
    expect(result).toContain('id');
    expect(result).toContain('name');
    expect(result).toContain('email');
  });

  it('should include variable definitions in the signature', () => {
    const result = new GraphQLQueryBuilder()
      .operation('query', 'GetUser')
      .withVariable('id', 'ID!')
      .select({ name: 'user', args: { id: '$id' }, fields: ['id', 'name'] })
      .build();
    expect(result).toContain('query GetUser($id: ID!)');
    expect(result).toContain('user(id: $id)');
  });

  it('should build a mutation with multiple variables', () => {
    const result = new GraphQLQueryBuilder()
      .operation('mutation', 'CreateUser')
      .withVariable('name', 'String!')
      .withVariable('email', 'String!')
      .select({
        name: 'createUser',
        args: { name: '$name', email: '$email' },
        fields: ['id', 'name', 'email'],
      })
      .build();
    expect(result).toContain('mutation CreateUser($name: String!, $email: String!)');
    expect(result).toContain('createUser(name: $name, email: $email)');
    expect(result).toContain('id');
  });

  it('should build a subscription', () => {
    const result = new GraphQLQueryBuilder()
      .operation('subscription', 'OnMessage')
      .withVariable('roomId', 'ID!')
      .select({ name: 'messageAdded', args: { roomId: '$roomId' }, fields: ['text', 'author'] })
      .build();
    expect(result).toContain('subscription OnMessage($roomId: ID!)');
    expect(result).toContain('messageAdded(roomId: $roomId)');
  });

  it('should render deeply nested field selections', () => {
    const result = new GraphQLQueryBuilder()
      .operation('query', 'GetPost')
      .withVariable('id', 'ID!')
      .select({
        name: 'post',
        args: { id: '$id' },
        fields: [
          'title',
          {
            name: 'author',
            fields: ['id', 'name'],
          },
        ],
      })
      .build();
    expect(result).toContain('post(id: $id)');
    expect(result).toContain('author');
    expect(result).toContain('title');
    // 'id' and 'name' are inside author's sub-selection
    const authorBlock = result.slice(result.indexOf('author'));
    expect(authorBlock).toContain('id');
    expect(authorBlock).toContain('name');
  });

  it('should be reusable across multiple build() calls', () => {
    const builder = new GraphQLQueryBuilder()
      .operation('query', 'GetUser')
      .withVariable('id', 'ID!')
      .select({ name: 'user', args: { id: '$id' }, fields: ['id', 'name'] });

    expect(builder.build()).toEqual(builder.build());
  });
});
