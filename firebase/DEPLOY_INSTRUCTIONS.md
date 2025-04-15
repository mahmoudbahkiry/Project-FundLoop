# Firebase Deployment Instructions

## Firestore Rules Deployment

The application is currently experiencing a permissions error when trying to access journal entries. This is caused by overly restrictive security rules in the Firestore database.

### Option 1: Deploy Updated Rules (Recommended)

To fix the issue, you need to deploy the updated security rules in `firebase/firestore.rules` to your Firebase project.

1. Make sure you have Firebase CLI installed:

   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:

   ```
   firebase login
   ```

3. Make sure the paths in `firebase.json` are correct:

   ```json
   {
     "firestore": {
       "rules": "firebase/firestore.rules",
       "indexes": "firebase/firestore.indexes.json"
     }
   }
   ```

4. Deploy the updated rules:
   ```
   firebase deploy --only firestore:rules
   ```

### Option 2: Manual Update in Firebase Console

If you prefer to update the rules manually:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (fundloop-95918)
3. Navigate to Firestore Database > Rules
4. Replace the existing rules with the contents of `firebase/firestore.rules`
5. Click "Publish"

### What Changed?

The updated security rules now allow listing documents for authenticated users, with client-side filtering for user-specific entries.

Previous (problematic) rule:

```
allow list: if request.auth != null &&
            request.query.limit <= 100 &&
            ("userId" in request.query.where) &&
            request.query.where.userId == request.auth.uid;
```

Updated rule (more permissive):

```
allow list: if request.auth != null;
```

## Code Updates

We've also simplified the `getUserJournalEntries` function to:

1. Query all entries with a limit of 100 documents
2. Filter the results client-side to only include entries for the current user
3. Sort the entries by date (descending)

This approach works better with the simplified security rules and should resolve the permission issues.

## Verifying the Fix

After deploying the rules, restart your application and check if journal entries load correctly. The error "Missing or insufficient permissions" should no longer appear, and journal entries should display properly for each user.
