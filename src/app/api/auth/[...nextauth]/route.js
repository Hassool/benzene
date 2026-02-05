// src/app/api/auth/[...nextauth]/route.js 

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongoose'
import User from '../../../../models/User'

const adminList = process.env.ADMINS?.split(',')
  .map(x => x.trim())
  .filter(Boolean) || []

const Yacine = process.env.YACINE

export const authOptions = {
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
          
          // Clean phone number for comparison
          const cleanPhoneNumber = credentials.phoneNumber.replace(/[\s\-\(\)]/g, '')

          
          // Find user by phone number and include password field
          const user = await User.findOne({
            phoneNumber: cleanPhoneNumber,
            isActive: true,  
            isDeleted: false
          }).select('+password')

          if (!user) {

            throw new Error('Invalid credentials')
          }


          // Verify password
          const isPasswordValid = await user.comparePassword(credentials.password)
          if (!isPasswordValid) {

            throw new Error('Invalid credentials')
          }

          // Update last login timestamp
          await User.findByIdAndUpdate(user._id, { 
            lastLogin: new Date() 
          }, { validateBeforeSave: false })

          return {
            id: user._id.toString(),
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            email: user.email || null,
            isActive: user.isActive,
            isAdmin: user.isAdmin,
            image: user.image || null
          }

        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Authentication failed')
        }
      }
    })
  ],

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.userId = user.id
        token.phoneNumber = user.phoneNumber
        token.fullName = user.fullName
        token.email = user.email
        token.isActive = user.isActive
        
        // Admin check: Database OR Environment Variable
        // user.isAdmin comes from the authorize return above
        const dbAdmin = user.isAdmin === true
        const envAdmin = user.phoneNumber && adminList.includes(user.phoneNumber)
        const isAdmin = dbAdmin || envAdmin
        
        // Yacine check
        const isYacine = Yacine && user.phoneNumber === Yacine

        
        token.isAdmin = isAdmin
        token.isYacine = isYacine
      } 
      
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId
        session.user.phoneNumber = token.phoneNumber
        session.user.fullName = token.fullName
        session.user.email = token.email
        session.user.isActive = token.isActive
        session.user.name = token.fullName
        session.user.isAdmin = token.isAdmin
        session.user.isYacine = token.isYacine
      }
      return session
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') {
        return true
      }
      
      if (account?.provider === 'google') {
        try {
          await connectDB()
          let existingUser = await User.findOne({ email: profile.email })
          if (!existingUser) {
            await User.create({
              fullName: profile.name,
              email: profile.email,
              image: profile.picture,
              emailVerified: new Date(),
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

  secret: process.env.NEXTAUTH_SECRET,
  
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
        maxAge: 30 * 24 * 60 * 60
      }
    }
  },

  events: {
    async signIn(message) {

    },
    async signOut(message) {

    },
    async createUser(message) {

    },
  },

  debug: false,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }