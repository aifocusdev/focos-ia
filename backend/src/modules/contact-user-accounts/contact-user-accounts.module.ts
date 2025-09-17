import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUserAccountsService } from './services/contact-user-accounts.service';
import { ContactUserAccountsController } from './controllers/contact-user-accounts.controller';
import { ContactUserAccount } from './entities/contact-user-account.entity';
import { ContactsModule } from '../contacts/contacts.module';
import { ServersModule } from '../servers/servers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactUserAccount]),
    ContactsModule,
    ServersModule,
  ],
  controllers: [ContactUserAccountsController],
  providers: [ContactUserAccountsService],
  exports: [ContactUserAccountsService],
})
export class ContactUserAccountsModule {}
