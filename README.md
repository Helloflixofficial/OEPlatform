## Getting Started
[![Header](https://utfs.io/f/2517ead1-0b23-4adb-a622-98439ccd8484-qnfatu.png "Header")](https://github.com/helloflixofficial)

https://utfs.io/f/2517ead1-0b23-4adb-a622-98439ccd8484-qnfatu.png
<!-- https://webdis-7ies.onrender.com/
https://webdis-7ies.onrender.com/vidcdn/watch/naruto-episode-220
https://github.com/vimeo -->
<!--
"error Tips 
git fetch origin main:tmp
git rebase tmp
git push"

git init
git add .
git commit -m "first commit"
git branch -M main
git push -u origin main 
///////////
…or push an existing repository from the command line
git remote add origin
git branch -M main
git push -u origin main
18:8-->

<!-- Website usefull for this projects and uploding data and information  -->
http://localhost:3000/ for Basic Need
https://ui.shadcn.com/ for UI
https://logoipsum.com/ for Demo Logo
https://colorhunt.co/ for Color Pick
https://dashboard.clerk.com/ for User & Authentication
/////////////////////////////////////////////////////////

Key Features:

- Browse & Filter Courses
- Purchase Courses using Stripe
- Mark Chapters as Completed or Uncompleted
- Progress Calculation of each Course
- Student Dashboard
- Teacher mode
- Create new Courses
- Create new Chapters
- Easily reorder chapter position with drag n’ drop
- Upload thumbnails, attachments and videos using UploadThing
- Video processing using Mux
- HLS Video player using Mux
- Rich text editor for chapter description
- Authentication using Clerk
- ORM using Prisma
- PostgreSQL database using koyeb

### Prerequisites

**Node version 18.x.x**

### Cloning the repository

```shell
git clone "repo here"
```

### Install packages

```shell
npm i
```

### Setup .env file

```js
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=

DATABASE_URL=

UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

STRIPE_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_TEACHER_ID=
```

### Setup Prisma

Add MySQL Database (I used PlanetScale)

```shell
npx prisma generate
npx prisma db push

```

### Start the app

```shell
npm run dev
```

## Available commands

Running commands with npm `npm run [command]`

| command | description                              |
| :------ | :--------------------------------------- |
| `dev`   | Starts a development instance of the app |


Examples

  Set up a new Prisma project
  $ prisma init

  Generate artifacts (e.g. Prisma Client)
  $ prisma generate

  Browse your data
  $ prisma studio

  Create migrations from your Prisma schema, apply them to the database, generate artifacts (e.g. Prisma Client)
  $ prisma migrate dev

  Pull the schema from an existing database, updating the Prisma schema
  $ prisma db pull

  Push the Prisma schema state to the database
  $ prisma db push

  Validate your Prisma schema
  $ prisma validate

  Format your Prisma schema
  $ prisma format

  Display Prisma version info
  $ prisma version

  Display Prisma debug info
  $ prisma debug
