-- Script to manually delete a user and their related data
-- Replace 'test@test.com' with the email you want to delete

-- Step 1: Find the user ID
SELECT id, email FROM auth.users WHERE email = 'test@test.com';

-- Step 2: Delete user's transactions (if any)
-- Replace 'USER_ID_HERE' with the actual user ID from step 1
DELETE FROM public.transactions WHERE user_id = 'USER_ID_HERE';

-- Step 3: Delete user's budgets (if any)
DELETE FROM public.budgets WHERE user_id = 'USER_ID_HERE';

-- Step 4: Delete user profile
DELETE FROM public.users WHERE id = 'USER_ID_HERE';

-- Step 5: Delete auth user
DELETE FROM auth.users WHERE id = 'USER_ID_HERE';

-- Or to delete ALL users at once (be careful!):
-- DELETE FROM public.transactions;
-- DELETE FROM public.budgets;
-- DELETE FROM public.users;
-- DELETE FROM auth.users;
