import { db } from '../firebase/config';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { GameSettings, Template } from '../types/types';
import { gameService } from './game';

const TEMPLATES_COLLECTION = 'templates';

export const templateService = {
  async createTemplate(template: Omit<Template, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), {
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create template');
    }
  },

  async getTemplate(id: string): Promise<Template | null> {
    try {
      const docRef = doc(db, TEMPLATES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Template;
      }
      return null;
    } catch (error) {
      console.error('Error getting template:', error);
      throw new Error('Failed to get template');
    }
  },

  async getPublicTemplates(): Promise<Template[]> {
    try {
      const q = query(collection(db, TEMPLATES_COLLECTION), where('isPublic', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Template[];
    } catch (error) {
      console.error('Error getting public templates:', error);
      throw new Error('Failed to get public templates');
    }
  },

  async getUserTemplates(userId: string): Promise<Template[]> {
    try {
      const q = query(collection(db, TEMPLATES_COLLECTION), where('createdBy', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Template[];
    } catch (error) {
      console.error('Error getting user templates:', error);
      throw new Error('Failed to get user templates');
    }
  },

  async updateTemplate(id: string, updates: Partial<Template>): Promise<void> {
    try {
      const docRef = doc(db, TEMPLATES_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    try {
      const docRef = doc(db, TEMPLATES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete template');
    }
  },

  /** All templates in Firestore (admin / template picker). */
  async getTemplates(): Promise<Template[]> {
    const snapshot = await getDocs(collection(db, TEMPLATES_COLLECTION));
    return snapshot.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as Template;
    });
  },

  /** Create a game using merged settings from a saved template. */
  async createGameFromTemplate(templateId: string, gameSettings: GameSettings): Promise<string> {
    const template = await templateService.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    const merged: GameSettings = {
      ...template.settings,
      ...gameSettings,
      phraseList: templateId,
    };
    return gameService.createGame(merged);
  },
}; 