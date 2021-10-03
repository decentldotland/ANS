import math
from matplotlib import pyplot as plt


radicaLen = [2, 3, 4, 5, 6]
labeLen = int(input("insert to-mint label's length(2-7): "))
usedRadicals = []
percentagePerRadical = []

percentageSum = 0
for len in radicaLen:

    if (len > labeLen) or (labeLen == len):
        continue
    usedRadicals.append(f"RL: {len}")
    percentage = (((len + labeLen) / (labeLen - len)) * 100 / math.e**len)
    print(f"percentage for radical having len {len} is : {percentage} %\n")
    percentagePerRadical.append(percentage)
    percentageSum += percentage

sortedPercentagePerRadical = percentagePerRadical[::-1]
print(f"total distributed percentage: {percentageSum} %")

plt.bar(list(usedRadicals), list(sortedPercentagePerRadical), align="center")
plt.grid(linestyle='--', linewidth=.5, axis='y', alpha=0.7)
plt.ylabel("allocated % from minting fee")
plt.xlabel("Radical's Length")
plt.suptitle(f"simulation for fee's distribution of minting a label with length = {labeLen}")
plt.title(f"total % distributed from the minting fee: {percentageSum}")
plt.show()