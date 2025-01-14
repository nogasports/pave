import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { SupportTicket } from './support';
import { Asset, AssetRequest } from './assets';
import { Employee } from './employees';

export const createAssetSupportTicket = async (
  asset: Asset,
  employee: Employee,
  type: 'maintenance' | 'issue' | 'return',
  description: string,
  priority: SupportTicket['priority'] = 'medium'
) => {
  try {
    // Create support ticket
    const ticketRef = await addDoc(collection(db, 'supportTickets'), {
      title: `Asset ${type}: ${asset.name} (${asset.assetNumber})`,
      description,
      category: 'assets',
      type: type === 'maintenance' ? 'hardware' : 'other',
      priority,
      status: 'open',
      submittedBy: employee.id,
      departmentId: employee.departmentId,
      assetId: asset.id,
      chatEnabled: true,
      messages: [],
      history: [{
        action: 'created',
        timestamp: new Date(),
        userId: employee.id,
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create asset request if needed
    if (type === 'return') {
      await addDoc(collection(db, 'assetRequests'), {
        assetId: asset.id,
        employeeId: employee.id,
        type: 'return',
        status: 'pending',
        reason: description,
        requestDate: new Date(),
        supportTicketId: ticketRef.id,
        history: [{
          status: 'pending',
          date: new Date(),
          comment: 'Return request created'
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return ticketRef.id;
  } catch (error) {
    console.error('Error creating asset support ticket:', error);
    throw error;
  }
};