import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBoards, createBoard, getCards, createCard, updateCard } from '../services/api';

const useKanbanStore = create(
  persist(
    (set, get) => ({
      boards: [],
      currentBoard: null,
      cards: [],
      loading: false,
      error: null,

      // Ações
      fetchBoards: async () => {
        set({ loading: true });
        try {
          const boards = await getBoards();
          set({ boards, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      addBoard: async (title) => {
        set({ loading: true });
        try {
          const newBoard = await createBoard({ title });
          set((state) => ({
            boards: [...state.boards, newBoard],
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      setCurrentBoard: (boardId) => {
        const board = get().boards.find((b) => b.id === boardId);
        set({ currentBoard: board });
      },

      fetchCards: async (boardId) => {
        set({ loading: true });
        try {
          const cards = await getCards(boardId);
          set({ cards, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      addCard: async (boardId, cardData) => {
        set({ loading: true });
        try {
          const newCard = await createCard(boardId, cardData);
          set((state) => ({
            cards: [...state.cards, newCard],
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      moveCard: async (boardId, cardId, status) => {
        set({ loading: true });
        try {
          const updatedCard = await updateCard(boardId, cardId, { status });
          set((state) => ({
            cards: state.cards.map((card) =>
              card.id === cardId ? updatedCard : card
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'kanban-storage',
      partialize: (state) => ({
        boards: state.boards,
        currentBoard: state.currentBoard,
      }),
    }
  )
);

export default useKanbanStore;