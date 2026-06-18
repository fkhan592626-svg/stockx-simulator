/// <reference types="node" />
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma/client'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'

export class AuthService {
  async register(data: {
    email: string
    username: string
    password: string
    firstName: string
    lastName: string
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    })

    if (existingUser) {
      throw new Error(
        existingUser.email === data.email
          ? 'Email already in use'
          : 'Username already taken'
      )
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    })

    await prisma.portfolio.create({
      data: {
        userId: user.id,
        totalValue: 0,
        totalCost: 0,
        totalPnL: 0,
        dayPnL: 0,
      },
    })

    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        cashBalance: user.cashBalance,
      },
      accessToken,
      refreshToken,
    }
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        cashBalance: user.cashBalance,
      },
      accessToken,
      refreshToken,
    }
  }

  async refreshToken(token: string) {
    const { verifyRefreshToken } = await import('../utils/jwt')
    const decoded = verifyRefreshToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    return { accessToken, refreshToken }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        cashBalance: true,
        createdAt: true,
      },
    })

    if (!user) throw new Error('User not found')
    return user
  }
}