import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface'; // Create this interface
import { AdminService } from '../admin/admin.service'; // Adjust according to your project structure
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminService: AdminService, // Inject any necessary service
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'), // Make sure to define JWT_SECRET in .env or config
    });
  }

  async validate(payload: JwtPayload) {
    // You can add custom validation logic here, like checking if the user exists in DB
    const admin = await this.adminService.FindById(payload.userId);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }
    return admin; // You can return user details here to be attached to request
  }
}
