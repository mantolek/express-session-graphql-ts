import { ObjectType, Field } from 'type-graphql';
import { FieldError } from './FieldError';

@ObjectType()
export class UserType {
  @Field()
  id: number;

  @Field()
  email: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
