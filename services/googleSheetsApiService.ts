import { Review, Business, ReviewSource, ReviewStatus, Sentiment } from '../types';

// This is a mock implementation of the Google Sheets API service.
// In a real application, this file would contain logic to fetch data
// from and write data to a Google Sheet using the Google Sheets API.

export const SPREADSHEET_ID = 'MOCK_SPREADSHEET_ID';

let nextReviewId = 1;
let nextBusinessId = 1;

// Initial mock data to simulate what would be fetched from a Google Sheet.
const initialBusinesses: Business[] = [
  { id: nextBusinessId++, name: 'The Local Cafe', rowIndex: 2 },
  { id: nextBusinessId++, name: 'Global Tech Inc.', rowIndex: 3 },
];

const initialReviews: Review[] = [
  {
    id: nextReviewId++,
    author: 'John Doe',
    rating: 5,
    text: 'Absolutely love this place! The coffee is the best in town and the staff are always so friendly. A real gem.',
    date: '2023-10-26',
    source: ReviewSource.Google,
    status: ReviewStatus.PendingAnalysis,
    businessName: 'The Local Cafe',
    rowIndex: 2,
  },
  {
    id: nextReviewId++,
    author: 'Jane Smith',
    rating: 2,
    text: 'The product I received was faulty and customer service has been unhelpful in resolving the issue. Very disappointed.',
    date: '2023-10-25',
    source: ReviewSource.Trustpilot,
    status: ReviewStatus.PendingAnalysis,
    businessName: 'Global Tech Inc.',
    rowIndex: 3,
  },
  {
    id: nextReviewId++,
    author: 'Alice Johnson',
    rating: 4,
    text: 'Great atmosphere and delicious pastries. The WiFi can be a bit slow sometimes, but overall a wonderful spot to work from.',
    date: '2023-10-24',
    source: ReviewSource.Yelp,
    status: ReviewStatus.Approved,
    businessName: 'The Local Cafe',
    analysis: { sentiment: Sentiment.Positive, intent: 'Praise for atmosphere' },
    response: 'Hi Alice, thank you for your feedback! We are so glad you enjoy our pastries and atmosphere. We are looking into improving our WiFi speed. Hope to see you again soon!',
    rowIndex: 4,
  },
  {
    id: nextReviewId++,
    author: 'Bob Brown',
    rating: 1,
    text: "My order was an hour late and arrived cold. I've tried calling support multiple times with no answer. Unacceptable.",
    date: '2023-10-22',
    source: ReviewSource.Facebook,
    status: ReviewStatus.PendingResponse,
    businessName: 'The Local Cafe',
    analysis: { sentiment: Sentiment.Negative, intent: 'Complaint about delivery' },
    rowIndex: 5,
  },
];

let mockBusinesses: Business[] = [...initialBusinesses];
let mockReviews: Review[] = [...initialReviews];


// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export const fetchData = async (): Promise<{ reviews: Review[]; businesses: Business[] }> => {
  console.log('Fetching data from mock service...');
  await delay(1000); // Simulate API call delay
  
  // In a real app, this would handle potential API errors
  // For now, we assume it always succeeds.
  return { reviews: [...mockReviews], businesses: [...mockBusinesses] };
};


export const updateReviewInSheet = async (rowIndex: number, updates: Partial<Review>): Promise<void> => {
    console.log(`Updating review at rowIndex ${rowIndex} with:`, updates);
    await delay(300); // Simulate API call delay
    
    const reviewIndex = mockReviews.findIndex(r => r.rowIndex === rowIndex);
    if (reviewIndex > -1) {
        mockReviews[reviewIndex] = { ...mockReviews[reviewIndex], ...updates };
    } else {
        console.error(`Mock update failed: Could not find review with rowIndex ${rowIndex}`);
        // In a real app, you might throw an error here.
    }
};

const DUMMY_REVIEWS_FOR_SCRAPING = [
    { rating: 5, text: "Incredible service and amazing results! Highly recommend to everyone.", source: ReviewSource.Google },
    { rating: 1, text: "A complete disaster. The product broke after one use and the company won't issue a refund. Avoid at all costs.", source: ReviewSource.Yelp },
    { rating: 3, text: "It's an okay product. Does the job but nothing spectacular. The price is a bit high for what you get.", source: ReviewSource.Facebook },
];


export const addBusinessAndScrape = async (
    businessName: string,
    allData: { reviews: Review[], businesses: Business[] }
): Promise<{ newBusiness: Business; newReviews: Review[] }> => {
    console.log(`Adding business "${businessName}" and scraping reviews...`);
    await delay(2500); // Simulate longer delay for "scraping"

    const newBusiness: Business = {
        id: nextBusinessId++,
        name: businessName,
        // The rowIndex would be the next available row in the sheet
        rowIndex: allData.businesses.length + 2,
    };
    mockBusinesses.push(newBusiness);

    const newReviews: Review[] = DUMMY_REVIEWS_FOR_SCRAPING.map((dummy, index) => {
        const authorNames = ['Chris Green', 'Pat Kim', 'Sam Jones'];
        return {
            id: nextReviewId++,
            author: authorNames[index % authorNames.length],
            rating: dummy.rating,
            text: dummy.text,
            date: new Date().toISOString().split('T')[0],
            source: dummy.source,
            status: ReviewStatus.PendingAnalysis,
            businessName: newBusiness.name,
            rowIndex: allData.reviews.length + index + 2, // Simple rowIndex simulation
        };
    });
    mockReviews = [...mockReviews, ...newReviews];
    
    return { newBusiness, newReviews };
};
