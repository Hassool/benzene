// src/app/api/auth/[...nextauth]/route.js 

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongoose'
import User from '@/models/User'

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phoneNumber: { 
          label: 'Phone Number', 
          type: 'tel',
          placeholder: '+1234567890'
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        }
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.password) {
          throw new Error('Phone number and password are required')
        }

        try {
          await connectDB()
          
          // Find user by phone number and include password field
          const user = await User.findOne({
            phoneNumber: credentials.phoneNumber.replace(/[\s\-\(\)]/g, ''),
            isActive: true
          }).select('+password')

          if (!user) {
            throw new Error('Invalid credentials')
          }

          // Verify password using the enhanced comparePassword method
          const isPasswordValid = await user.comparePassword(credentials.password)
          
          if (!isPasswordValid) {
            throw new Error('Invalid credentials')
          }

          // Update last login timestamp
          await User.findByIdAndUpdate(user._id, { 
            lastLogin: new Date() 
          }, { 
            validateBeforeSave: false 
          })

          // Return user object (password will be automatically excluded by toJSON transform)
          return {
            id: user._id.toString(),
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            image: user.image
          }

        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Authentication failed')
        }
      }
    })
    
    // You can add other providers here (Google, Facebook, etc.)
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
  ],

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.userId = user.id
        token.role = user.role
        token.phoneNumber = user.phoneNumber
        token.fullName = user.fullName
      }
      
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId
        session.user.role = token.role
        session.user.phoneNumber = token.phoneNumber
        session.user.fullName = token.fullName
      }
      
      return session
    },

    // Optional: Add custom sign in callback for additional checks
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') {
        // Additional checks can be added here
        return true
      }
      
      // Handle OAuth providers
      if (account?.provider === 'google') {
        try {
          await connectDB()
          
          // Check if user exists with this email
          let existingUser = await User.findOne({ email: profile.email })
          
          if (!existingUser) {
            // Create new user from OAuth profile
            existingUser = await User.create({
              fullName: profile.name,
              email: profile.email,
              image: profile.picture,
              emailVerified: new Date(),
              // Note: No password for OAuth users
            })
          }
          
          return true
        } catch (error) {
          console.error('OAuth sign in error:', error)
          return false
        }
      }
      
      return true
    },
  },

  // Enhanced security configuration
  secret: process.env.NEXTAUTH_SECRET,
  
  // Security headers
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    }
  },

  // Event handlers for logging/monitoring
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user?.phoneNumber || message.user?.email)
    },
    async signOut(message) {
      console.log('User signed out:', message.token?.phoneNumber || message.token?.email)
    },
    async createUser(message) {
      console.log('New user created:', message.user?.phoneNumber || message.user?.email)
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }