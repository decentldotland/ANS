import math
import matplotlib.pyplot as plt

labels = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
UP = 200 # Unit Price
CONSTANT_K = 10

minting_prices_result = []

print(f"\n\nCalculating for Unit Price equal to ${UP} with a CONSTANT_K of ${CONSTANT_K}\n")

for label_length in labels:
    mint_price = round((16 - label_length) * UP / (math.exp(label_length)) + ((CONSTANT_K * (16 - label_length)) / 2))
    print(f"minting cost for label of length {label_length} is ${mint_price}")
    minting_prices_result.append(mint_price)

# PLOT THE FIGURE

plt.figure()

plt.plot(labels, minting_prices_result)
plt.xlabel("LABEL LENGTH")
plt.ylabel("MINTING PRICE")

plt.show()

import itertools
