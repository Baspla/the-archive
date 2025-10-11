import { router } from '../init';
import { usersRouter } from './users';
import { collectionsRouter } from './collections';
import { commentsRouter } from './comments';
import { likesRouter } from './likes';
import { pennamesRouter } from './pennames';
import { worksRouter } from './works';

export const appRouter = router({
    collections: collectionsRouter,
    works: worksRouter,
    users: usersRouter,
    pennames: pennamesRouter,
    comments: commentsRouter,
    likes: likesRouter,
});

export type AppRouter = typeof appRouter;
