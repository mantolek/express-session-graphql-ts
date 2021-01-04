import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver, Query } from 'type-graphql';
import { User } from '../entity/User';
import { AuthInput } from '../graphql-types/AuthInput';
import { MyContext } from '../graphql-types/MyContext';
import { UserResponse, UserType } from '../graphql-types/UserResponse';
import { Direction } from '../enum/Enum';

const invalidLoginResponse = {
  errors: [
    {
      path: 'email',
      message: 'invalid login',
    },
  ],
};

@Resolver()
export class AuthResolver {
  // REGISTER
  @Mutation(() => UserResponse)
  async register(
    @Arg('input') { email, password }: AuthInput
  ): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        errors: [
          {
            path: 'email',
            message: 'already in use',
          },
        ],
      };
    }

    const user = await User.create({
      email,
      password: hashedPassword,
    }).save();

    return { user };
  }
  // mutation {
  //   register(input: { email: "a@77.a", password: "a" }) {
  //     user {
  //       email
  //       id
  //     }
  //     errors {
  //       message
  //     }
  //   }
  // }

  // LOGIN
  @Mutation(() => UserResponse)
  async login(
    @Arg('input') { email, password }: AuthInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return invalidLoginResponse;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return invalidLoginResponse;
    }

    ctx.req.session!.userId = user.id;

    return { user };
  }

  // USER
  @Query(() => UserType, { nullable: true })
  async me(@Ctx() ctx: MyContext): Promise<UserType | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined;
    }

    return User.findOne(ctx.req.session!.userId);
  }
  // {
  //   me {
  //     email
  //   }
  // }

  // LOGOUT
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: MyContext): Promise<Boolean> {
    return new Promise((res, rej) =>
      ctx.req.session!.destroy((err) => {
        if (err) {
          console.log(err);
          return rej(false);
        }

        ctx.res.clearCookie('qid');
        return res(true);
      })
    );
  }

  // FIND ALL USERS
  @Query(() => [UserType])
  async allMe() {
    return User.find();
  }

  // *check ENUM
  @Query(() => String)
  checkEnum(@Arg('direction') direction: string) {
    let arr;
    switch (direction) {
      case Direction.UP:
        arr = 'up';
        break;
      case Direction.DOWN:
        arr = 'down';
        break;
      case Direction.LEFT:
        arr = 'left';
        break;
      case Direction.RIGHT:
        arr = 'right';
        break;
      default:
        return false;
    }
    return arr;
  }
  // {
  // 	checkEnum(direction: "LEFT")
  // }
}
