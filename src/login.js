import passport from 'passport';
import { Strategy } from 'passport-local';
import { comparePasswords, findById, findByUsername } from './users.js';

async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);

    if (!user) {
      return done(null, false);
    }

    const result = await comparePasswords(password, user.password);
    // console.info(`Skráður inn sem ${username}`);
    return done(null, result ? user : false);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

passport.use(new Strategy(strat));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  }
});

export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/admin/');
}

export default passport;
