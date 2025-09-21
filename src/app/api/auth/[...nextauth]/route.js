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
          console.log('Attempting login with phone number:', cleanPhoneNumber)
          
          // Find user by phone number and include password field
          const user = await User.findOne({
            phoneNumber: cleanPhoneNumber,
            isActive: true,  
            isDeleted: false
          }).select('+password')

          if (!user) {
            console.log('User not found for phone number:', cleanPhoneNumber)
            throw new Error('Invalid credentials')
          }

          console.log('User found:', {
            id: user._id,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName
          })

          // Verify password
          const isPasswordValid = await user.comparePassword(credentials.password)
          if (!isPasswordValid) {
            console.log('Invalid password for user:', user.phoneNumber)
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
      console.log('JWT callback triggered:', { 
        hasAccount: !!account, 
        hasUser: !!user,
        accountProvider: account?.provider,
        tokenPhoneNumber: token.phoneNumber
      })
      
      if (account && user) {
        console.log('Initial login - Setting token data for user:', user.phoneNumber)
        
        token.userId = user.id
        token.phoneNumber = user.phoneNumber
        token.fullName = user.fullName
        token.email = user.email
        token.isActive = user.isActive
        
        // Admin check with extensive debug logging
        console.log('=== ADMIN CHECK START ===')
        console.log('Environment check:', {
          NODE_ENV: process.env.NODE_ENV,
          ADMINS_raw: process.env.ADMINS,
          ADMINS_exists: !!process.env.ADMINS,
          YACINE_raw: process.env.YACINE,
          YACINE_exists: !!process.env.YACINE
        })
        
        console.log('Admin list details:', {
          adminList: adminList,
          adminListType: typeof adminList,
          adminListLength: adminList.length,
          adminListIsArray: Array.isArray(adminList)
        })
        
        console.log('Yacine details:', {
          value: Yacine,
          type: typeof Yacine
        })
        
        if (adminList.length > 0) {
          console.log('First admin details:', {
            value: adminList[0],
            type: typeof adminList[0],
            length: adminList[0]?.length,
            chars: Array.from(adminList[0] || '').map(c => `'${c}' (${c.charCodeAt(0)})`).join(', ')
          })
        }
        
        console.log('User phone details:', {
          value: user.phoneNumber,
          type: typeof user.phoneNumber,
          length: user.phoneNumber?.length,
          chars: Array.from(user.phoneNumber || '').map(c => `'${c}' (${c.charCodeAt(0)})`).join(', ')
        })
        
        // Try different comparison methods
        const strictIncludes = adminList.includes(user.phoneNumber)
        const looseIncludes = adminList.some(admin => admin == user.phoneNumber)
        const trimmedIncludes = adminList.some(admin => admin.trim() === user.phoneNumber.trim())
        
        // Yacine check
        const isYacine = Yacine && user.phoneNumber === Yacine
        
        console.log('Comparison results:', {
          strictIncludes,
          looseIncludes,
          trimmedIncludes,
          manualCheck: adminList[0] === user.phoneNumber,
          isYacine
        })
        
        const isAdmin = user.phoneNumber && adminList.includes(user.phoneNumber)
        console.log('Final results:', { isAdmin, isYacine })
        console.log('=== ADMIN CHECK END ===')
        
        token.isAdmin = isAdmin
        token.isYacine = isYacine
      } else if (token.phoneNumber && (typeof token.isAdmin === 'undefined' || typeof token.isYacine === 'undefined')) {
        // This handles subsequent requests where we have a token but no user object
        // Check if admin/yacine status was never set and set it now
        console.log('Subsequent request - checking admin and yacine status for existing token')
        console.log('Token phone:', token.phoneNumber)
        console.log('Admin list:', adminList)
        console.log('Yacine:', Yacine)
        
        const isAdmin = adminList.includes(token.phoneNumber)
        const isYacine = Yacine && token.phoneNumber === Yacine
        
        console.log('Setting status for existing token:', { isAdmin, isYacine })
        token.isAdmin = isAdmin
        token.isYacine = isYacine
      }
      
      console.log('JWT callback returning token with:', { 
        isAdmin: token.isAdmin, 
        isYacine: token.isYacine 
      })
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

        console.log('Session created:', {
          userId: session.user.id,
          phoneNumber: session.user.phoneNumber,
          isAdmin: session.user.isAdmin,
          isYacine: session.user.isYacine
        })
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
      console.log('User signed in:', message.user?.phoneNumber || message.user?.email)
      console.log('Admin and Yacine check in events:', {
        phoneNumber: message.user?.phoneNumber,
        adminList,
        isAdmin: adminList.includes(message.user?.phoneNumber),
        Yacine,
        isYacine: Yacine && message.user?.phoneNumber === Yacine
      })
    },
    async signOut(message) {
      console.log('User signed out:', message.token?.phoneNumber || message.token?.email)
    },
    async createUser(message) {
      console.log('New user created:', message.user?.phoneNumber || message.user?.email)
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }