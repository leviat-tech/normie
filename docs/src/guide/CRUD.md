# CRUD

After initialization, your `Entity` classes will have control over data in the `entities` store.

## Create

```js
const user = User.create({ name: 'roger' })
```

This will:
- return an instance of `User` that has access to related entities and methods supplied by Normie
- add a JSON representation of this user to the `users` namespace of the `entities` store

Assuming posts belong to users, we can create both at the same time:

```js
const user = User.create({
  name: 'roger',
  posts: [
    { body: 'body1' },
    { body: 'body2' }
  ]
})
```

## Read

```js
const post = Post.find(postId)
const posts = Post.read() // returns all posts
```

We can retrieve all posts with the same `userId` with the following:


```js
Post.whereForeignKey('userId', userId)
User.find(userId).posts // same thing
```

## Update
```js
const user = User.read().find(user => user.name === 'roger')
User.update(user.id, { name: 'rafa' })
user.$update({ name: 'rafa' }) // same thing
user.name = 'rafa' // also same thing
```

Updating relationships isn't so different - let's say we want to change the user of all posts belonging to Novak:

```js
const novak = User.read().find(user => user.name === 'novak')
const rafa = User.read().find(user => user.name === 'rafa')

novak.posts.forEach(post => {
  post.userId = rafa.id
  post.user = rafa // same thing!
})
```

## Delete

```js
User.delete(novak.id)
novak.$delete() // same thing
```

If `{ onDeleteCascade: true }` is passed as the third argument to `belongsTo()` (or the second argument to `foreignKey()`), any children will get deleted with the parent.