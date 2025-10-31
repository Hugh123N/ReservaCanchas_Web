export class User {
    id: string = '';
    username: string = '';
    password: string = '';
    email: string = '';
    telefono: string = '';
    accessToken: string = '';
    refreshToken: string = '';
    roles: number[] = [];
    pic: string = '';
    fullname: string = '';
    occupation: string = '';
    companyName: string = '';
    phone: string = '';

    clear(): void {
        this.id = '';
        this.username = '';
        this.password = '';
        this.email = '';
        this.telefono = '';
        this.roles = [];
        this.fullname = '';
        this.accessToken = 'access-token-' + Math.random();
        this.refreshToken = 'access-token-' + Math.random();
        this.pic = './assets/media/users/default.jpg';
        this.occupation = '';
        this.companyName = '';
        this.phone = '';
    }
}
