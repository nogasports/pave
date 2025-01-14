const getEmployees = async (): Promise<Employee[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'employees'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Handle different date formats safely
        dateOfBirth: data.dateOfBirth ? 
          (data.dateOfBirth instanceof Date ? 
            data.dateOfBirth : 
            // Handle both Firestore Timestamp and string dates
            data.dateOfBirth.toDate?.() || new Date(data.dateOfBirth)
          ) : null,
        // Add other date fields as needed
        startDate: data.startDate?.toDate?.() || new Date(data.startDate),
        endDate: data.endDate?.toDate?.() || null
      };
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};
