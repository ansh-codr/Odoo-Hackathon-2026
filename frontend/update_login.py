import re

with open('src/routes/login.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
import_regex = r'import \{\n\s*signInWithEmailAndPassword,\n\s*signInWithPopup,\n\s*GoogleAuthProvider,\n\s*createUserWithEmailAndPassword,\n\s*updateProfile,\n\} from "firebase/auth";\nimport \{ auth \} from "../lib/firebase";'
import_replacement = 'import { auth } from "../lib/firebase";\nimport { loginUser, registerUser, loginWithGoogle } from "../services/authService";'
content = re.sub(import_regex, import_replacement, content)

# 2. Update handleSubmit
handleSubmit_regex = r'if \(isSignUp\) \{\n\s*const userCred = await createUserWithEmailAndPassword\(auth, email, password\);\n\s*await updateProfile\(userCred\.user, \{ displayName: name \}\);\n\s*\} else \{\n\s*await signInWithEmailAndPassword\(auth, email, password\);\n\s*\}'
handleSubmit_replacement = """if (isSignUp) {
        await registerUser(email, password, name);
      } else {
        await loginUser(email, password);
      }"""
content = re.sub(handleSubmit_regex, handleSubmit_replacement, content)

# 3. Update handleGoogleLogin
handleGoogleLogin_regex = r'const provider = new GoogleAuthProvider\(\);\n\s*await signInWithPopup\(auth, provider\);'
handleGoogleLogin_replacement = 'await loginWithGoogle();'
content = re.sub(handleGoogleLogin_regex, handleGoogleLogin_replacement, content)

with open('src/routes/login.tsx', 'w') as f:
    f.write(content)
