import bcrypt from 'bcrypt';
export class CredentialsService {
    async comparePassword(userPassword: string, dbHashedPassword: string) {
        return await bcrypt.compare(userPassword, dbHashedPassword);
    }
}
