'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Shield, UserX, History } from 'lucide-react';
import { format } from 'date-fns';
import { UserRole } from '@prisma/client';

interface ActiveUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  lastLogin: Date;
  twoFactorEnabled: boolean;
}

interface ActiveUsersTableProps {
  searchQuery: string;
}

export default function ActiveUsersTable({ searchQuery }: ActiveUsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');

  const handleSuspend = async (userId: string) => {
    try {
      // Call API to suspend user
      console.log('Suspending user:', userId, 'Reason:', suspensionReason);
      setShowSuspendDialog(false);
      setSuspensionReason('');
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const mockActiveUsers: ActiveUser[] = [
    {
      id: '1',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'SKIPPER',
      status: 'active',
      lastLogin: new Date(),
      twoFactorEnabled: true,
    },
    // Add more mock data as needed
  ];

  const filteredUsers = mockActiveUsers.filter((user) =>
    Object.values(user).some(
      (value) =>
        typeof value === 'string' &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>2FA</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.status === 'active' ? 'default' : 'secondary'}
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(user.lastLogin, 'MMM d, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.twoFactorEnabled ? 'default' : 'secondary'}
                >
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <History className="mr-2 h-4 w-4" />
                      View Activity Log
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowSuspendDialog(true);
                      }}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Suspend Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User Account</DialogTitle>
            <DialogDescription>
              Please provide a reason for suspending this user account.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={suspensionReason}
            onChange={(e) => setSuspensionReason(e.target.value)}
            placeholder="Enter suspension reason..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuspendDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleSuspend(selectedUser.id)}
            >
              Suspend Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
