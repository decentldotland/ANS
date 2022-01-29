import math
from matplotlib import pyplot as plt


radicaLen = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
labeLen = int(input("insert to-mint label's length(2-15): "))
usedRadicals = []
percentagePerRadical = []
percentageSum = 0

# PoR start
for radlen in range(radicaLen[0], radicaLen[-1]):

    if (radlen > labeLen) or (labeLen == radlen): # radicals -logically- have a length lower than to-mint label length
        continue
    usedRadicals.append(f"RL: {radlen}")
    percentage = (((radlen + labeLen) / (labeLen - radlen)) * 100 / math.e**radlen)
    percentagePerRadical.append(percentage)
    percentageSum += percentage
# reverse the percentages
sortedPercentagePerRadical = percentagePerRadical[::-1]
# PoR fin

print(f"total distributed percentage: {percentageSum} %")
# visualization
plt.bar(list(usedRadicals), list(sortedPercentagePerRadical), align="center")
plt.grid(linestyle='--', linewidth=.5, axis='y', alpha=0.7)
plt.ylabel("allocated % from minting fee")
plt.xlabel("Radical's Length")
plt.suptitle(f"simulation for fee's distribution of minting a label with length = {labeLen}")
plt.title(f"total % distributed from the minting fee: {percentageSum}")
plt.show()
