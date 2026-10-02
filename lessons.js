// Original, short educational notes supplied with EduGod. No external textbook content is copied.
export const lessons = [
  {
    id: 'linear-equations', subject: 'Mathematics', title: 'Solve a linear equation',
    text: 'A linear equation has a variable raised only to the first power. To solve ax + b = c, keep the two sides equal while undoing operations. First subtract b from each side. Then divide each side by a, provided a is not zero. For 2x + 3 = 11, subtracting 3 gives 2x = 8, so x = 4. Always substitute your answer into the original equation: 2(4) + 3 = 11. If the x terms cancel, check whether the remaining numbers are equal. Equal numbers mean every x works; unequal numbers mean no x works.',
    question: 'What is x in 3x + 2 = 14?', options: ['3', '4', '5'], correct: 1, explanation: 'Subtract 2 to get 3x = 12, then divide by 3.'
  },
  {
    id: 'fractions', subject: 'Mathematics', title: 'Understand fractions',
    text: 'A fraction describes part of a whole or a ratio between quantities. The numerator counts parts and the denominator tells how many equal parts make one whole. For example, 3/4 is three of four equal parts. To add fractions, first express them with the same denominator: 1/2 + 1/4 becomes 2/4 + 1/4 = 3/4. To multiply fractions, multiply numerators and denominators. To divide by a nonzero fraction, multiply by its reciprocal. A fraction can be simplified by dividing its numerator and denominator by the same common factor.',
    question: 'What is 1/2 + 1/4?', options: ['2/6', '3/4', '1/8'], correct: 1, explanation: '1/2 is 2/4, so 2/4 + 1/4 = 3/4.'
  },
  {
    id: 'percentages', subject: 'Mathematics', title: 'Percentages in daily life',
    text: 'Percent means “per hundred.” To calculate 15% of 200, write 15/100 × 200 = 30. A 20% increase on 50 gives 50 + 10 = 60. A 20% decrease from 50 gives 50 − 10 = 40. When calculating a percentage change, divide the change by the original amount and multiply by 100. Keep the original amount clear: a rise of 10 followed by a fall of 10 does not necessarily return you to the starting value when both changes are percentages.',
    question: 'What is 25% of 80?', options: ['15', '20', '25'], correct: 1, explanation: '25% is one quarter, and one quarter of 80 is 20.'
  },
  {
    id: 'motion', subject: 'Physics', title: 'Speed, distance, and time',
    text: 'Average speed is total distance divided by total time. If a cyclist travels 30 kilometres in 2 hours, the average speed is 15 kilometres per hour. Rearranging gives distance = speed × time and time = distance ÷ speed. Use consistent units before calculating: convert minutes to hours if speed is in kilometres per hour. Speed has magnitude only; velocity also includes direction. A journey can have nonzero average speed but zero average velocity when it ends where it started.',
    question: 'At 10 km/h, how far do you travel in 3 hours?', options: ['13 km', '30 km', '300 km'], correct: 1, explanation: 'Distance = speed × time = 10 × 3 = 30 km.'
  },
  {
    id: 'photosynthesis', subject: 'Biology', title: 'How photosynthesis works',
    text: 'Green plants use light energy to make sugars from carbon dioxide and water. Chlorophyll in chloroplasts absorbs light. The overall process releases oxygen as a by-product. The sugar can be used for energy, stored, or built into other plant materials. Light, carbon dioxide, water, and suitable temperature all affect how fast photosynthesis can happen. It is different from respiration: plants also respire to release usable energy from food.',
    question: 'Which gas is released during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Hydrogen'], correct: 0, explanation: 'The overall photosynthesis process releases oxygen.'
  },
  {
    id: 'atoms', subject: 'Chemistry', title: 'Atoms and elements',
    text: 'Matter is made of atoms. An atom has a nucleus containing protons and neutrons, with electrons around it. The number of protons is the atomic number and identifies the element. A neutral atom has the same number of electrons as protons. Atoms of the same element can have different numbers of neutrons; these are isotopes. When atoms join chemically, they form molecules or larger structures. A chemical reaction rearranges atoms, but ordinary chemical reactions do not turn one element into another.',
    question: 'What identifies an element?', options: ['Number of neutrons', 'Number of protons', 'Number of molecules'], correct: 1, explanation: 'The atomic number is the number of protons.'
  },
  {
    id: 'sentences', subject: 'English', title: 'Build a clear sentence',
    text: 'A basic English sentence usually needs a subject and a verb. “The student reads” is complete because someone performs an action. Add an object or details when useful: “The student reads a chapter every evening.” Check that the verb agrees with the subject: “she reads,” but “they read.” Keep one main idea in a short sentence. When combining ideas, use punctuation and a suitable joining word so the reader can follow the relationship.',
    question: 'Which sentence is complete?', options: ['Because the lesson', 'The student reads', 'Under the table'], correct: 1, explanation: '“The student reads” contains a subject and a verb.'
  },
  {
    id: 'python-variables', subject: 'Coding', title: 'Variables in Python',
    text: 'A variable is a name that refers to a value. In Python, score = 5 assigns the number 5 to score. Later, score = score + 1 updates it to 6. Names help make programs readable; choose names that describe their purpose. A string is text in quotes, while an integer is a whole number. The expression 5 + 2 gives 7, but "5" + "2" gives the text "52". Check value types when a calculation behaves unexpectedly.',
    question: 'After x = 4 and x = x + 3, what is x?', options: ['4', '7', '43'], correct: 1, explanation: 'The second assignment adds 3 to the current value 4.'
  },
  {
    id: 'simple-interest', subject: 'Commerce', title: 'Calculate simple interest',
    text: 'Simple interest is calculated on the original principal only. The formula is interest = principal × annual rate × time, when the rate is written as a decimal and time is in years. For a principal of 1,000 at 5% per year for 2 years, interest is 1,000 × 0.05 × 2 = 100. The total amount is principal plus interest, or 1,100. Compound interest is different because later interest can be calculated on earlier interest as well.',
    question: 'What is one year of simple interest on 1,000 at 10%?', options: ['10', '100', '1,100'], correct: 1, explanation: '1,000 × 0.10 × 1 = 100.'
  },
  {
    id: 'study-review', subject: 'Study skills', title: 'Review a mistake well',
    text: 'When an answer is wrong, record the first step where your reasoning went off track. Ask whether the cause was a concept gap, a calculation error, or a misread question. Correct the step yourself, then solve a similar question without looking at the solution. Return to the topic after a delay: spaced review is more useful than repeating the same easy question many times in one sitting. A short, honest mistake note gives you a clear plan for the next study session.',
    question: 'What should you identify first after a wrong answer?', options: ['The first incorrect step', 'A harder exam', 'A new subject'], correct: 0, explanation: 'Finding the first incorrect step makes the fix specific.'
  }
];
